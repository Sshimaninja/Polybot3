import { BigNumber as BN } from "bignumber.js";
import { utils, BigNumber } from "ethers";
import { RouterMap, uniswapV2Router } from "../../constants/addresses";
import { FactoryPair, Pair, Profit } from "../../constants/interfaces";
import { gasVprofit } from "./gasVprofit";
import { BoolTrade } from "../../constants/interfaces"
import { AmountCalculator } from "../amountCalcSingle";
/*
TODO: Change args to be an object, i.e. smartpool/pair, reserves, etc.
*/
export class Trade {
    trade: BoolTrade | undefined;
    pair: FactoryPair;
    match: Pair;
    amounts0: AmountCalculator;
    amounts1: AmountCalculator;

    constructor(pair: FactoryPair, match: Pair, amounts0: AmountCalculator, amounts1: AmountCalculator) {
        this.pair = pair;
        this.match = match;
        this.amounts0 = amounts0;
        this.amounts1 = amounts1;
    }

    async getTradefromAmounts(): Promise<BoolTrade> {

        let routerA_id = uniswapV2Router[this.pair.exchangeA];
        let routerB_id = uniswapV2Router[this.pair.exchangeB];
        let higher = BN.max(this.amounts0.amountOutBN, this.amounts1.amountOutBN);
        let lower = BN.min(this.amounts0.amountOutBN, this.amounts1.amountOutBN);

        let difference = higher.minus(lower);
        let differencePercent = difference.div(higher).multipliedBy(100);

        let A1 = higher.eq(this.amounts0.amountOutBN);
        let B1 = higher.eq(this.amounts0.amountOutBN);

        var direction = B1 ? "B1" : A1 ? "A1" : "DIRECTIONAL AMBIGUITY ERROR";

        var trade: BoolTrade = {
            direction: direction,
            ticker: this.match.ticker,
            tokenIn: this.match.token0,
            tokenOut: this.match.token1,
            tradeSize: A1 ? this.amounts0.tradeSize : this.amounts1.tradeSize,
            loanPool: {
                exchange: A1 ? this.pair.exchangeB : this.pair.exchangeA,
                factory: A1 ? this.pair.factoryB_id : this.pair.factoryA_id,
                router: A1 ? routerB_id : routerA_id,
                poolID: A1 ? this.match.poolB_id : this.match.poolA_id,
                amountOut: A1 ? this.amounts1.amountOutBN : this.amounts0.amountOutBN,
                amountOutjs: A1 ? this.amounts1.amountOutJS : this.amounts0.amountOutJS,
                amountRepay: A1 ? this.amounts1.amountRepayBN : this.amounts0.amountRepayBN,
                amountRepayjs: A1 ? this.amounts1.amountRepayJS : this.amounts0.amountRepayJS,
                tokenOutPrice: A1 ? this.amounts1.price?.priceOutBN : this.amounts0.price?.priceOutBN,
                reserveIn: A1 ? this.amounts1.price?.reserveInBN : this.amounts0.price?.reserveInBN,
                reserveInjs: A1 ? this.amounts1.price?.reserveIn : this.amounts0.price?.reserveIn,
                reserveOut: A1 ? this.amounts1.price?.reserveOutBN : this.amounts0.price?.reserveOutBN,
                reserveOutjs: A1 ? this.amounts1.price?.reserveOut : this.amounts0.price?.reserveOut,
                factoryID: A1 ? this.pair.factoryB_id : this.pair.factoryA_id,
                routerID: A1 ? routerB_id : routerA_id,
            },
            recipient: {
                exchange: A1 ? this.pair.exchangeA : this.pair.exchangeB,
                factory: A1 ? this.pair.factoryA_id : this.pair.factoryB_id,
                router: A1 ? routerA_id : routerB_id,
                poolID: A1 ? this.match.poolA_id : this.match.poolB_id,
                amountOut: A1 ? this.amounts0.amountOutBN : this.amounts1.amountOutBN,
                amountOutjs: A1 ? this.amounts0.amountOutJS : this.amounts1.amountOutJS,
                amountRepay: A1 ? this.amounts0.amountRepayBN : this.amounts1.amountRepayBN,
                amountRepayjs: A1 ? this.amounts0.amountRepayJS : this.amounts1.amountRepayJS,
                tokenOutPrice: A1 ? this.amounts0.price?.priceOutBN : this.amounts1.price?.priceOutBN,
                reserveIn: A1 ? this.amounts0.price?.reserveInBN : this.amounts1.price?.reserveInBN,
                reserveInjs: A1 ? this.amounts0.price?.reserveIn : this.amounts1.price?.reserveIn,
                reserveOut: A1 ? this.amounts0.price?.reserveOutBN : this.amounts1.price?.reserveOutBN,
                reserveOutjs: A1 ? this.amounts0.price?.reserveOut : this.amounts1.price?.reserveOut,
                routerID: A1 ? routerA_id : routerB_id,
                factoryID: A1 ? this.pair.factoryA_id : this.pair.factoryB_id,
            },
            profitBN: A1 ? this.amounts0.amountOutBN.minus(this.amounts1.amountRepayBN) : this.amounts1.amountOutBN.minus(this.amounts0.amountRepayBN),
            profitJS: A1 ? this.amounts0.amountOutJS.sub(this.amounts1.amountRepayJS) : this.amounts1.amountOutJS.sub(this.amounts0.amountRepayJS),
        };
        return trade;
    }


}

