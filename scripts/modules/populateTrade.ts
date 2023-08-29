import { BigNumber as BN } from "bignumber.js";
import { utils, BigNumber } from "ethers";
import { RouterMap, uniswapV2Router } from "../../constants/addresses";
import { Amounts, FactoryPair, GasData, Pair, Profit } from "../../constants/interfaces";
import { Prices } from "./prices";
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

    async getTradefromAmounts(): Promise<BoolTrade> {

        let routerA_id = uniswapV2Router[this.pair.exchangeA];
        let routerB_id = uniswapV2Router[this.pair.exchangeB];
        let higher = BN.max(this.amounts0.amountOutBN, this.amounts1.amountOutBN);
        let lower = BN.min(this.amounts0.amountOutBN, this.amounts1.amountOutBN);

        // let difference = higher.minus(lower);
        // let differencePercent = difference.div(higher).multipliedBy(100);

        let A1 = higher.eq(this.amounts0.amountOutBN);
        let B1 = higher.eq(this.amounts1.amountOutBN);

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
                tokenOutPrice: A1 ? this.price1.priceOutBN : this.price0.priceOutBN,
                reserveIn: A1 ? this.price1.reserves.reserveInBN : this.price0.reserves.reserveInBN,
                reserveInjs: A1 ? this.price1.reserves.reserveIn : this.price0.reserves.reserveIn,
                reserveOut: A1 ? this.price1.reserves.reserveOutBN : this.price0.reserves.reserveOutBN,
                reserveOutjs: A1 ? this.price1.reserves.reserveOut : this.price0.reserves.reserveOut,
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
                tokenOutPrice: A1 ? this.price0.priceOutBN : this.price0.priceOutBN,
                reserveIn: A1 ? this.price0.reserves.reserveInBN : this.price0.reserves.reserveInBN,
                reserveInjs: A1 ? this.price0.reserves.reserveIn : this.price0.reserves.reserveIn,
                reserveOut: A1 ? this.price0.reserves.reserveOutBN : this.price0.reserves.reserveOutBN,
                reserveOutjs: A1 ? this.price0.reserves.reserveOut : this.price0.reserves.reserveOut,
                routerID: A1 ? routerA_id : routerB_id,
                factoryID: A1 ? this.pair.factoryA_id : this.pair.factoryB_id,
            },
            gasData: this.gasData,
            profitBN: A1 ? this.amounts0.amountOutBN.minus(this.amounts1.amountRepayBN) : B1 ? this.amounts1.amountOutBN.minus(this.amounts0.amountRepayBN) : BN(0),
            profitJS: A1 ? this.amounts0.amountOutJS.sub(this.amounts1.amountRepayJS) : B1 ? this.amounts1.amountOutJS.sub(this.amounts0.amountRepayJS) : BigNumber.from(0),
        };
        return trade;
    }


}

