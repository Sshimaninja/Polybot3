import { BigNumber as BN } from "bignumber.js";
import { BigNumber } from "ethers";
import { RouterMap, uniswapV2Router } from "../../constants/addresses";
import { FactoryPair, Pair } from "../../constants/interfaces";
import { BoolTrade } from "../../constants/interfaces"
import { AmountCalculator } from "../amountCalcSingle";
/*
TODO: Change args to be an object, i.e. smartpool/pair, reserves, etc.
*/

export async function getTradefromAmounts(
    pair: FactoryPair,
    match: Pair,
    amounts0: AmountCalculator,
    amounts1: AmountCalculator,
) {
    let routerA_id = uniswapV2Router[pair.exchangeA]
    let routerB_id = uniswapV2Router[pair.exchangeB]
    let higher = BN.max((amounts0.amountOutBN), (amounts1.amountOutBN))
    let lower = BN.min((amounts0.amountOutBN), (amounts1.amountOutBN))
    // let greater = BN.max((a0), (b0))
    // let lesser = BN.min((a0), (b0))

    let difference = higher.minus(lower)
    let differencePercent = (difference.div(higher)).multipliedBy(100)

    // let B0 = lower == BN(a1) && greater == BN(a0) //flashing from A1 to B0
    let A1 = higher.eq(amounts0.amountOutBN) //&& greater == BN(a0) //flashing from A0 to B1
    let B1 = higher.eq(amounts0.amountOutBN) //&& greater == BN(b0) //flashing from B0 to A1
    // let A0 = lower == BN(b1) && greater == BN(b0) //flashing from B1 to A0

    var direction = B1 ? "B1" : A1 ? "A1" : "DIRECTIONAL AMBIGUITY ERROR"
    // var direction: any = B0 ? "B0" : B1 ? "B1" : A1 ? "A1" : A0 ? "A0" : "DIRECTIONAL AMBIGUITY ERROR"

    var trade: BoolTrade = {
        direction: direction,
        loanPool: {
            exchange: A1 ? pair.exchangeB : pair.exchangeA,
            poolID: A1 ? match.poolB_id : match.poolA_id,
            amountOut: A1 ? amounts1.amountOutBN : amounts0.amountOutBN,
            amountOutjs: A1 ? amounts1.amountOutJS : amounts0.amountOutJS,
            amountRepay: A1 ? amounts1.amountRepayBN : amounts0.amountRepayBN,
            amountRepayjs: A1 ? amounts1.amountRepayJS : amounts0.amountRepayJS,
            tokenOutPrice: A1 ? amounts1.price?.priceOutBN : amounts0.price?.priceOutBN,
            reserveIn: A1 ? amounts1.price?.reserveInBN : amounts0.price?.reserveInBN,
            reserveInjs: A1 ? amounts1.price?.reserveIn : amounts0.price?.reserveIn,
            reserveOut: A1 ? amounts1.price?.reserveOutBN : amounts0.price?.reserveOutBN,
            reserveOutjs: A1 ? amounts1.price?.reserveOut : amounts0.price?.reserveOut,
            factoryID: A1 ? pair.factoryB_id : pair.factoryA_id,
            routerID: A1 ? routerB_id : routerA_id,
        },
        recipient: {
            exchange: A1 ? pair.exchangeA : pair.exchangeB,
            poolID: A1 ? match.poolA_id : match.poolB_id,
            amountOut: A1 ? amounts0.amountOutBN : amounts1.amountOutBN,
            amountOutjs: A1 ? amounts0.amountOutJS : amounts1.amountOutJS,
            amountRepay: A1 ? amounts0.amountRepayBN : amounts1.amountRepayBN,
            amountRepayjs: A1 ? amounts0.amountRepayJS : amounts1.amountRepayJS,
            tokenOutPrice: A1 ? amounts0.price?.priceOutBN : amounts1.price?.priceOutBN,
            reserveIn: A1 ? amounts0.price?.reserveInBN : amounts1.price?.reserveInBN,
            reserveInjs: A1 ? amounts0.price?.reserveIn : amounts1.price?.reserveIn,
            reserveOut: A1 ? amounts0.price?.reserveOutBN : amounts1.price?.reserveOutBN,
            reserveOutjs: A1 ? amounts0.price?.reserveOut : amounts1.price?.reserveOut,
            routerID: A1 ? routerA_id : routerB_id,
            factoryID: A1 ? pair.factoryA_id : pair.factoryB_id,
        },
    }

    return trade
}