import { BigNumber as BN } from "bignumber.js";
import { utils, BigNumber } from "ethers";
import { RouterMap, uniswapV2Router } from "../../constants/addresses";
import { Amounts, FactoryPair, GasData, Pair, BoolTrade } from "../../constants/interfaces";
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IRouter } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { wallet } from "../../constants/contract";
import { Contract } from "@ethersproject/contracts";
import { Prices } from "./prices";
import { getAmountsIn, getAmountsOut } from "./getAmountsIOLocal";

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
    async getRepay(tradeSize: BigNumber, reserveOut: BigNumber, reserveIn: BigNumber): Promise<BigNumber> {
        const directRepayJS = await getAmountsIn(tradeSize, reserveOut, reserveIn); // result must be token1
        return directRepayJS;
    }

    async getTradefromAmounts(): Promise<BoolTrade> {
        const routerA_id = uniswapV2Router[this.pair.exchangeA];
        const routerB_id = uniswapV2Router[this.pair.exchangeB];

        // Calculate direct repayment amounts with slippage
        const directRepayAmt0BN: string = BN(utils.formatUnits(this.amounts0.tradeSize, this.match.token0.decimals)).multipliedBy(1.003009027).toFixed(this.match.token0.decimals);
        const directRepayAmt1BN: string = BN(utils.formatUnits(this.amounts1.tradeSize, this.match.token0.decimals)).multipliedBy(1.003009027).toFixed(this.match.token0.decimals);

        const directRepay0JS: BigNumber = utils.parseUnits(directRepayAmt0BN, this.match.token0.decimals);
        const directRepay1JS: BigNumber = utils.parseUnits(directRepayAmt1BN, this.match.token0.decimals);

        // Determine direct repayment by passing the receiving pool's calculated 0.1% slippage tradeSize using the loanPool's reserves
        const repay0 = await getAmountsIn(directRepay0JS, this.price0.reserves.reserveOut, this.price0.reserves.reserveIn);
        const repay1 = await getAmountsIn(directRepay1JS, this.price1.reserves.reserveOut, this.price1.reserves.reserveIn);

        const A: BN = this.price0.priceOutBN;
        const B: BN = this.price1.priceOutBN;

        const direction = A.lt(B) ? "A" : B.lt(A) ? "B" : "DIRECTIONAL AMBIGUITY ERROR";

        const trade: BoolTrade = {
            direction: direction,
            ticker: this.match.token0.symbol + "/" + this.match.token1.symbol,
            tokenIn: this.match.token0,
            tokenOut: this.match.token1,
            loanPool: {
                priceIn: A ? this.price1.priceInBN.toFixed(this.match.token0.decimals) : this.price0.priceInBN.toFixed(this.match.token0.decimals),
                priceOut: A ? this.price1.priceOutBN.toFixed(this.match.token1.decimals) : this.price0.priceOutBN.toFixed(this.match.token1.decimals),
                exchange: A ? this.pair.exchangeB : this.pair.exchangeA,
                factory: A ? new Contract(this.pair.factoryB_id, IFactory, wallet) : new Contract(this.pair.factoryA_id, IFactory, wallet),
                router: A ? new Contract(routerB_id, IRouter, wallet) : new Contract(routerA_id, IRouter, wallet),
                pool: A ? new Contract(this.match.poolB_id, IPair, wallet) : new Contract(this.match.poolA_id, IPair, wallet),
                amountOutJS: await getAmountsOut(
                    A ? this.amounts0.amountOutJS : this.amounts1.amountOutJS,
                    this.price0.reserves.reserveIn,
                    this.price0.reserves.reserveOut
                ),
                amountRepayJS: A ? directRepay1JS : directRepay0JS,
                reserveInJS: A ? this.price1.reserves.reserveIn : this.price0.reserves.reserveIn,
                reserveOutJS: A ? this.price1.reserves.reserveOut : this.price0.reserves.reserveOut,
                factoryID: A ? this.pair.factoryB_id : this.pair.factoryA_id,
                routerID: A ? routerB_id : routerA_id,
            },
            recipient: {
                priceIn: A ? this.price0.priceInBN.toFixed(this.match.token0.decimals) : this.price1.priceInBN.toFixed(this.match.token0.decimals),
                priceOut: A ? this.price0.priceOutBN.toFixed(this.match.token1.decimals) : this.price1.priceOutBN.toFixed(this.match.token1.decimals),
                tradeSize: A ? this.amounts0.tradeSize : this.amounts1.tradeSize,
                exchange: A ? this.pair.exchangeA : this.pair.exchangeB,
                factory: A ? new Contract(this.pair.factoryA_id, IFactory, wallet) : new Contract(this.pair.factoryB_id, IFactory, wallet),
                router: A ? new Contract(routerA_id, IRouter, wallet) : new Contract(routerB_id, IRouter, wallet),
                pool: A ? new Contract(this.match.poolA_id, IPair, wallet) : new Contract(this.match.poolB_id, IPair, wallet),
                amountOutJS: await getAmountsOut(
                    A ? this.amounts0.tradeSize : this.amounts1.tradeSize,
                    this.price1.reserves.reserveIn,
                    this.price1.reserves.reserveOut
                ),
                reserveInJS: A ? this.price0.reserves.reserveIn : this.price1.reserves.reserveIn,
                reserveOutJS: A ? this.price0.reserves.reserveOut : this.price1.reserves.reserveOut,
                routerID: A ? routerA_id : routerB_id,
                factoryID: A ? this.pair.factoryA_id : this.pair.factoryB_id,
            },
            gasData: this.gasData,
            profitJS: BigNumber.from(0),
        };

        trade.profitJS = trade.loanPool.amountOutJS.sub(trade.loanPool.amountRepayJS);

        const loanCost = trade.loanPool.amountOutJS.sub(trade.loanPool.amountRepayJS);

        const tradeResult = {
            ticker: trade.ticker,
            loanPool: {
                exchange: trade.loanPool.exchange,
                priceIn: trade.loanPool.priceIn,
                priceOut: trade.loanPool.priceOut,
                reservesIn: utils.formatUnits(trade.loanPool.reserveInJS, trade.tokenIn.decimals),
                reservesOut: utils.formatUnits(trade.loanPool.reserveOutJS, trade.tokenOut.decimals),
                amountRepay: A ? directRepayAmt1BN : directRepayAmt0BN,
                amountOut: utils.formatUnits(trade.loanPool.amountOutJS, trade.tokenOut.decimals),
            },
            recipient: {
                exchange: trade.recipient.exchange,
                priceIn: trade.recipient.priceIn,
                priceOut: trade.recipient.priceOut,
                targetPrice: trade.loanPool.priceOut,
                reservesIn: utils.formatUnits(trade.recipient.reserveInJS, trade.tokenIn.decimals),
                reservesOut: utils.formatUnits(trade.recipient.reserveOutJS, trade.tokenOut.decimals),
                tradeSize: utils.formatUnits(trade.recipient.tradeSize, trade.tokenIn.decimals),
                amountOut: utils.formatUnits(trade.recipient.amountOutJS, trade.tokenOut.decimals),
            },
            result: {
                loanCostPercent: utils.formatUnits(loanCost.div(trade.recipient.amountOutJS).mul(100), trade.tokenOut.decimals),
                profit: utils.formatUnits(trade.profitJS, trade.tokenOut.decimals),
            },
        };

        console.log(tradeResult);

        return trade;
    }
}
