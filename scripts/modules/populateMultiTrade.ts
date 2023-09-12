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


        //This will probably need some attention. I'm not sure if it's correct.
        //Try calculating this mathematically, rather than using getAmountsIn.

        const amountRepay0: BigNumber = await this.getRepay(
            this.amounts0.tradeSize,
            this.price0.reserves.reserveIn,
            this.price0.reserves.reserveOut)

        const amountRepay1: BigNumber = await this.getRepay(
            this.amounts1.amountOutJS,
            this.price1.reserves.reserveIn,
            this.price1.reserves.reserveOut)

        let A: BigNumber = this.amounts0.amountOutJS.sub(amountRepay1);
        let B: BigNumber = this.amounts1.amountOutJS.sub(amountRepay0);

        let direction = A.gt(B) ? "A" : B.gt(A) ? "B" : "DIRECTIONAL AMBIGUITY ERROR";

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
            amountRepay: A ? amountRepay1 : amountRepay0,
            profit: A ? A : B,
        };

        //We need the amountOut from loanpool to see now much of token0 loan can be repaid.
        // trade.loanPool.amountOut = await getAmountsIn(trade.amountRepay, trade.loanPool.reserveIn, trade.loanPool.reserveOut);


        let uniswapKPre = (trade.loanPool.reserveIn.mul(trade.loanPool.reserveOut))
        let uniswapKPost = (trade.loanPool.reserveIn.sub(trade.amountRepay).mul(trade.loanPool.reserveOut.add(trade.profit)))
        let uniswapKDiff = uniswapKPost.sub(uniswapKPre)

        // if (A.gt(0) && B.gt(0)) {
        const d = {
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
                uniswapkPre: utils.formatUnits(uniswapKPre, trade.tokenIn.decimals * 2),
                uniswapkPost: utils.formatUnits(uniswapKPost, trade.tokenIn.decimals * 2),
                uniswapKPositive: uniswapKDiff.gt(0),
                loanCostPercent: utils.formatUnits((trade.loanPool.amountOut.div(trade.amountRepay)).mul(100), trade.tokenOut.decimals),
                profit: utils.formatUnits(trade.profit, trade.tokenOut.decimals),
            }
        }
        console.log(d);
        // }

        return trade;
    }
}

