import { BigNumber as BN } from "bignumber.js";
import { utils, BigNumber } from "ethers";
import { RouterMap, uniswapV2Router } from "../../constants/addresses";
import { Amounts, FactoryPair, GasData, Pair, Profit } from "../../constants/interfaces";
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IRouter } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { wallet } from "../../constants/contract";
import { Contract } from "@ethersproject/contracts";
import { Prices } from "./prices";
import { gasVprofit } from "./gasVprofit";
import { BoolTrade } from "../../constants/interfaces"
import { AmountCalculator } from "../amountCalcSingle";
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
    async getRepay(tradeSize: BigNumber, reserveOut: BigNumber, reserveIn: BigNumber): Promise<BigNumber> {
        const amountRepayJS = await getAmountsIn(tradeSize, reserveOut, reserveIn); // result must be token1
        return amountRepayJS;
    }

    async getTradefromAmounts(): Promise<BoolTrade> {

        let routerA_id = uniswapV2Router[this.pair.exchangeA];
        let routerB_id = uniswapV2Router[this.pair.exchangeB];

        /**
         *  Here, try to experiment with the trade size to see if it is possible to get a profit.
         * 
         *  Problems: 
         * *  - amountRepay is *sometimes* a negative number, sometimes not. Why?
         *    - It seems correct for USDC/WETH, WMATIC/WETH, but not for WMATIC/QUICK etc. 
         * 
         *  - amountRepay in flash.sol is causing an error (see #1). Either try calculating it differently here, or in flash.sol.
         * 
         *  Solutions:
         *  - Write into this function a method to measure the profit from both direct and multi trades and then populate the trade with the most profitable one.
         *  - Filter out negative amountsRepay trades as they are invalid.
         */

        const amountRepay0JS: BigNumber = await this.getRepay(
            this.amounts1.tradeSize,            //if tradeSize == 1000
            this.price0.reserves.reserveOut,
            this.price0.reserves.reserveIn)

        const amountRepay1JS: BigNumber = await this.getRepay(
            this.amounts0.tradeSize,
            this.price1.reserves.reserveOut,
            this.price1.reserves.reserveIn)

        let A: BigNumber = amountRepay1JS.lt(this.price0.reserves.reserveIn) && amountRepay1JS.lt(this.price0.reserves.reserveIn) ? this.amounts0.amountOutJS.sub(amountRepay1JS) : BigNumber.from(0)
        let B: BigNumber = amountRepay0JS.lt(this.price1.reserves.reserveIn) && amountRepay0JS.lt(this.price1.reserves.reserveIn) ? this.amounts1.amountOutJS.sub(amountRepay0JS) : BigNumber.from(0)


        let direction = A.gt(B) ? "A" : B.gt(A) ? "B" : "DIRECTIONAL AMBIGUITY ERROR";

        var trade: BoolTrade = {
            direction: direction,
            ticker: this.match.token0.symbol + "/" + this.match.token1.symbol,
            tokenIn: this.match.token0,
            tokenOut: this.match.token1,
            // tradeSize: A ? this.amounts0.tradeSize : this.amounts1.tradeSize,
            loanPool: {
                priceIn: A ? this.price1.priceInBN.toFixed(this.match.token0.decimals) : this.price0.priceInBN.toFixed(this.match.token0.decimals),
                priceOut: A ? this.price1.priceOutBN.toFixed(this.match.token1.decimals) : this.price0.priceOutBN.toFixed(this.match.token1.decimals),
                // tradeSize: A ? this.amounts1.tradeSize : this.amounts0.tradeSize,
                exchange: A ? this.pair.exchangeB : this.pair.exchangeA,
                factory: A ? new Contract(this.pair.factoryB_id, IFactory, wallet) : new Contract(this.pair.factoryA_id, IFactory, wallet),
                router: A ? new Contract(routerB_id, IRouter, wallet) : new Contract(routerA_id, IRouter, wallet),
                pool: A ? new Contract(this.match.poolB_id, IPair, wallet) : new Contract(this.match.poolA_id, IPair, wallet),
                amountOutJS: A ? this.amounts1.amountOutJS : this.amounts0.amountOutJS,
                amountRepayJS: A ? amountRepay1JS : amountRepay0JS,
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
                // amountRepayJS: A ? amountRepay0JS : amountRepay1JS,
                amountOutJS: A ? this.amounts0.amountOutJS : this.amounts1.amountOutJS,
                reserveInJS: A ? this.price0.reserves.reserveIn : this.price1.reserves.reserveIn,
                reserveOutJS: A ? this.price0.reserves.reserveOut : this.price1.reserves.reserveOut,
                routerID: A ? routerA_id : routerB_id,
                factoryID: A ? this.pair.factoryA_id : this.pair.factoryB_id,
            },
            gasData: this.gasData,
            profitJS: A ? A : B,
        };

        // if (A.gt(0) && B.gt(0)) {
        const d = {
            ticker: trade.ticker,
            loanPool: {
                exchange: trade.loanPool.exchange,
                priceIn: trade.loanPool.priceIn,
                pripriceOutce1: trade.loanPool.priceOut,
                reservesIn: utils.formatUnits(trade.loanPool.reserveInJS, trade.tokenIn.decimals),
                reservesOut: utils.formatUnits(trade.loanPool.reserveOutJS, trade.tokenOut.decimals),
                // tradeSize: utils.formatUnits(trade.loanPool.tradeSize, trade.tokenIn.decimals),
                // amountOut: utils.formatUnits(trade.loanPool.amountOutJS, trade.tokenOut.decimals),
                amountRepay: utils.formatUnits(trade.loanPool.amountRepayJS, trade.tokenOut.decimals),
            },
            recipient: {
                exchange: trade.recipient.exchange,
                priceIn: trade.recipient.priceIn,
                priceOut: trade.recipient.priceOut,
                reservesIn: utils.formatUnits(trade.recipient.reserveInJS, trade.tokenIn.decimals),
                reservesOut: utils.formatUnits(trade.recipient.reserveOutJS, trade.tokenOut.decimals),
                tradeSize: utils.formatUnits(trade.recipient.tradeSize, trade.tokenIn.decimals),
                amountOut: utils.formatUnits(trade.recipient.amountOutJS, trade.tokenOut.decimals),
                // amountRepay: utils.formatUnits(trade.recipient.amountRepayJS, trade.tokenOut.decimals),
                // loanCostPercent: utils.formatUnits((trade.recipient.amountOutJS.div(trade.recipient.amountRepayJS)).mul(100), trade.tokenOut.decimals)
            },
            result: {
                loanCostPercent: utils.formatUnits((trade.loanPool.amountOutJS.div(trade.loanPool.amountRepayJS)).mul(100), trade.tokenOut.decimals),
                profit: utils.formatUnits(trade.profitJS, trade.tokenOut.decimals),
            }
        }
        console.log(d);
        // }

        return trade;
    }
}

