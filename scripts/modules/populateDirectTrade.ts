import { BigNumber as BN } from "bignumber.js";
import { utils, BigNumber } from "ethers";
import { Amounts, FactoryPair, GasData, Pair, BoolTrade } from "../../constants/interfaces";
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IRouter } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { wallet, flashDirect } from "../../constants/contract";
import { Contract } from "@ethersproject/contracts";
import { Prices } from "./prices";
import { getAmountsOut } from "./getAmountsIOLocal";
/**
 *
 */
export class Trade {
    trade: BoolTrade | undefined;
    pair: FactoryPair;
    match: Pair;
    price0: Prices;
    price1: Prices;
    amounts0: Amounts;
    amounts1: Amounts;
    gasData: GasData;

    constructor(pair: FactoryPair, match: Pair, price0: Prices, price1: Prices, amounts0: Amounts, amounts1: Amounts, gasData: GasData) {
        this.pair = pair;
        this.price0 = price0;
        this.price1 = price1;
        this.match = match;
        this.amounts0 = amounts0;
        this.amounts1 = amounts1;
        this.gasData = gasData;
    }

    // Get repayment amount for the loanPool
    async getRepayDirect(tradeSize: BigNumber): Promise<BigNumber> {
        // const repayBN = BN(utils.formatUnits(tradeSize, this.match.token0.decimals)).multipliedBy(1.003009027).toFixed(this.match.token0.decimals);
        // const repay = utils.parseUnits(repayBN, this.match.token0.decimals);
        const repay = tradeSize.mul(1003009027).div(1000000000);
        return repay;
    }

    async getTradefromAmounts(): Promise<BoolTrade> {

        const A: BN = this.price0.priceOutBN;
        const B: BN = this.price1.priceOutBN;

        const direction = A.lt(B) ? "A" : B.lt(A) ? "B" : "DIRECTIONAL AMBIGUITY ERROR";

        const trade: BoolTrade = {
            direction: direction,
            ticker: this.match.token0.symbol + "/" + this.match.token1.symbol,
            tokenIn: this.match.token0,
            tokenOut: this.match.token1,
            flash: flashDirect,
            loanPool: {
                exchange: A ? this.pair.exchangeB : this.pair.exchangeA,
                factory: A ? new Contract(this.pair.factoryB_id, IFactory, wallet) : new Contract(this.pair.factoryA_id, IFactory, wallet),
                router: A ? new Contract(this.pair.routerB_id, IRouter, wallet) : new Contract(this.pair.routerA_id, IRouter, wallet),
                pool: A ? new Contract(this.match.poolB_id, IPair, wallet) : new Contract(this.match.poolA_id, IPair, wallet),
                reserveIn: A ? this.price1.reserves.reserveIn : this.price0.reserves.reserveIn,
                reserveOut: A ? this.price1.reserves.reserveOut : this.price0.reserves.reserveOut,
                priceIn: A ? this.price1.priceInBN.toFixed(this.match.token0.decimals) : this.price0.priceInBN.toFixed(this.match.token0.decimals),
                priceOut: A ? this.price1.priceOutBN.toFixed(this.match.token1.decimals) : this.price0.priceOutBN.toFixed(this.match.token1.decimals),
                //this is wrong, but it's a placeholder. It must be recalculated using the recipient.amoutnOut as input.
                amountOut: BigNumber.from(0),
            },
            recipient: {
                exchange: A ? this.pair.exchangeA : this.pair.exchangeB,
                factory: A ? new Contract(this.pair.factoryA_id, IFactory, wallet) : new Contract(this.pair.factoryB_id, IFactory, wallet),
                router: A ? new Contract(this.pair.routerA_id, IRouter, wallet) : new Contract(this.pair.routerB_id, IRouter, wallet),
                pool: A ? new Contract(this.match.poolA_id, IPair, wallet) : new Contract(this.match.poolB_id, IPair, wallet),
                reserveIn: A ? this.price0.reserves.reserveIn : this.price1.reserves.reserveIn,
                reserveOut: A ? this.price0.reserves.reserveOut : this.price1.reserves.reserveOut,
                priceIn: A ? this.price0.priceInBN.toFixed(this.match.token0.decimals) : this.price1.priceInBN.toFixed(this.match.token0.decimals),
                priceOut: A ? this.price0.priceOutBN.toFixed(this.match.token1.decimals) : this.price1.priceOutBN.toFixed(this.match.token1.decimals),
                tradeSize: A ? this.amounts0.tradeSize : this.amounts1.tradeSize,
                //calculated using loanPool's priceOut as target price
                amountOut: A ? this.amounts0.amountOutJS : this.amounts1.amountOutJS,
            },
            gasData: this.gasData,
            amountRepay: await this.getRepayDirect(A ? this.amounts0.tradeSize : this.amounts1.tradeSize,),
            profit: BigNumber.from(0),
        };

        //We need the amountOut from loanpool to see now much of token0 loan can be repaid.
        trade.loanPool.amountOut = await getAmountsOut(trade.recipient.amountOut, trade.loanPool.reserveOut, trade.loanPool.reserveIn);
        //The below could be correct, or could be reversed. Too tired to think about it just now. 
        trade.profit = trade.loanPool.amountOut.gt(trade.amountRepay) ? trade.loanPool.amountOut.sub(trade.recipient.amountOut) : BigNumber.from(0);

        const loanCost = trade.amountRepay.sub(trade.recipient.tradeSize)

        // While taking into account the trade, the constant for uniswap is x * y = k, which must remain, else the trade reverts.
        // x * y = k
        let k = {
            uniswapKPre: trade.loanPool.reserveIn.mul(trade.loanPool.reserveOut),
            uniswapKPost: (trade.loanPool.reserveIn.sub(trade.recipient.tradeSize)).mul(trade.loanPool.reserveIn.add(trade.amountRepay))
        }
        let uniswapKDiff = (k.uniswapKPost).sub(k.uniswapKPre);

        const tradeResult = {
            trade: "direct",
            direction: trade.direction,
            ticker: trade.ticker,
            loanPool: {
                exchange: trade.loanPool.exchange,
                priceIn: trade.loanPool.priceIn,
                priceOut: trade.loanPool.priceOut,
                reservesIn: utils.formatUnits(trade.loanPool.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
                reservesOut: utils.formatUnits(trade.loanPool.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
                amountRepay: utils.formatUnits(trade.amountRepay, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
                // AmounOut direct is how much of token0 you can get for recipient.amountOut and whether that's enough to repay the loan.
                amountOut: utils.formatUnits(trade.loanPool.amountOut, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
            },
            recipient: {
                exchange: trade.recipient.exchange,
                priceIn: trade.recipient.priceIn,
                priceOut: trade.recipient.priceOut,
                targetPrice: trade.loanPool.priceOut,
                reservesIn: utils.formatUnits(trade.recipient.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
                reservesOut: utils.formatUnits(trade.recipient.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
                tradeSize: utils.formatUnits(trade.recipient.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
                amountOut: utils.formatUnits(trade.recipient.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
            },
            result: {
                uniswapkPre: k.uniswapKPre.gt(0) ? k.uniswapKPre.toString() : 0,
                uniswapkPost: k.uniswapKPost.gt(0) ? k.uniswapKPost.toString() : 0,
                uniswapKPositive: uniswapKDiff.gte(0),
                // loanCostPercent: utils.formatUnits(loanCost.div(trade.recipient.amountOut).mul(100), trade.tokenOut.decimals),
                profit: utils.formatUnits(trade.profit, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
            },
        };

        console.log(tradeResult);

        return trade;
    }
}
