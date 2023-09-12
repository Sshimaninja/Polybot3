import { utils, BigNumber } from "ethers";
import { Amounts, FactoryPair, GasData, Pair, Profit } from "../../constants/interfaces";
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IRouter } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { wallet, flashMulti } from "../../constants/contract";
import { Contract } from "@ethersproject/contracts";
import { Prices } from "./prices";
import { BoolTrade } from "../../constants/interfaces"
import { getAmountsIn } from "./getAmountsIOLocal";
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
        this.amounts0 = amounts0
        this.amounts1 = amounts1;
        this.gasData = gasData;
    }

    // Get repayment amount for the loanPool
    async getRepay(tradeSize: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {

        const amountRepay = await getAmountsIn(tradeSize, reserveIn, reserveOut); // result must be token1
        return amountRepay;
    }

    async getTradefromAmounts(): Promise<BoolTrade> {


        // //I prefer deciding trade based on profit, but it migth be necessary to decide based on price.
        // The technique for using profit would be to calc the repay first, then work out profit first, et voila.
        // however, walk before run.
        // let A: BigNumber = this.amounts0.amountOutJS.sub(amountRepayB);
        // let B: BigNumber = this.amounts1.amountOutJS.sub(amountRepayA);
        const A = this.price0.priceOutBN;
        const B = this.price1.priceOutBN;

        //Determines which trade is more profitable.
        //'A' means flash pool A, 'B' means flash pool B. This implies that the opposit pool is the loan pool.

        // Using profit, the greater is obviously better:
        // let direction = A.gt(B) ? "A" : B.gt(A) ? "B" : "DIRECTIONAL AMBIGUITY ERROR";

        // Using price, the lesser is better:
        const direction = A.lt(B) ? "A" : B.lt(A) ? "B" : "DIRECTIONAL AMBIGUITY ERROR";

        var trade: BoolTrade = {
            direction: direction,
            ticker: this.match.token0.symbol + "/" + this.match.token1.symbol,
            tokenIn: this.match.token0,
            tokenOut: this.match.token1,
            flash: flashMulti,
            loanPool: {
                exchange: A ? this.pair.exchangeB : this.pair.exchangeA,
                factory: A ? new Contract(this.pair.factoryB_id, IFactory, wallet) : new Contract(this.pair.factoryA_id, IFactory, wallet),
                router: A ? new Contract(this.pair.routerB_id, IRouter, wallet) : new Contract(this.pair.routerA_id, IRouter, wallet),
                pool: A ? new Contract(this.match.poolB_id, IPair, wallet) : new Contract(this.match.poolA_id, IPair, wallet),
                reserveIn: A ? this.price1.reserves.reserveIn : this.price0.reserves.reserveIn,
                reserveOut: A ? this.price1.reserves.reserveOut : this.price0.reserves.reserveOut,
                priceIn: A ? this.price1.priceInBN.toFixed(this.match.token0.decimals) : this.price0.priceInBN.toFixed(this.match.token0.decimals),
                priceOut: A ? this.price1.priceOutBN.toFixed(this.match.token1.decimals) : this.price0.priceOutBN.toFixed(this.match.token1.decimals),
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
                amountOut: A ? this.amounts0.amountOutJS : this.amounts1.amountOutJS,
            },
            gasData: this.gasData,
            amountRepay: BigNumber.from(0),
            profit: BigNumber.from(0)
        };

        trade.amountRepay = trade.loanPool.reserveIn.gt(trade.recipient.tradeSize) ?
            await this.getRepay(
                trade.recipient.tradeSize,
                trade.loanPool.reserveOut,
                trade.loanPool.reserveIn
            ) : BigNumber.from(0);

        //We need the amountOut from loanpool to see now much of token0 loan can be repaid.
        // trade.loanPool.amountOut = await getAmountsIn(trade.amountRepay, trade.loanPool.reserveIn, trade.loanPool.reserveOut);

        trade.profit = trade.recipient.amountOut.gt(trade.amountRepay) ? trade.recipient.amountOut.sub(trade.amountRepay) : BigNumber.from(0);

        // While taking into account the trade, the constant for uniswap is x * y = k, which must remain, else the trade reverts.
        // x * y = k
        let uniswapKPre = trade.loanPool.reserveIn.mul(trade.loanPool.reserveOut)
        let uniswapKPost = (trade.loanPool.reserveIn.sub(trade.recipient.tradeSize)).mul(trade.loanPool.reserveOut.add(trade.profit))
        let uniswapKDiff = (uniswapKPost).sub(uniswapKPre);


        // if (A.gt(0) && B.gt(0)) {
        const d = {
            trade: "Multi",
            ticker: trade.ticker,
            loanPool: {
                exchange: trade.loanPool.exchange,
                priceIn: trade.loanPool.priceIn,
                priceOut: trade.loanPool.priceOut,
                reservesIn: utils.formatUnits(trade.loanPool.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
                reservesOut: utils.formatUnits(trade.loanPool.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
                amountRepay: utils.formatUnits(trade.amountRepay, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
            },
            recipient: {
                exchange: trade.recipient.exchange,
                priceIn: trade.recipient.priceIn,
                priceOut: trade.recipient.priceOut,
                reservesIn: utils.formatUnits(trade.recipient.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
                reservesOut: utils.formatUnits(trade.recipient.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
                tradeSize: utils.formatUnits(trade.recipient.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
                amountOut: utils.formatUnits(trade.recipient.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
            },
            result: {
                uniswapkPre: uniswapKPre.toString(),
                uniswapkPost: uniswapKPost.toString(),
                uniswapKPositive: uniswapKDiff.gt(0),
                // loanCostPercent: utils.formatUnits((trade.loanPool.amountOut.div(trade.amountRepay)).mul(100), trade.tokenOut.decimals),
                profit: utils.formatUnits(trade.profit, trade.tokenOut.decimals),
            }
        }
        console.log(d);
        // }

        return trade;
    }
}

