import { BigNumber as BN } from "bignumber.js";
import { BigNumber } from "ethers";
import { BoolTrade } from "../../constants/interfaces"
import { SmartPool } from "./smartPool";
import { SmartPair } from "./smartPair";

export class GetTrade {
    pool: SmartPool;
    // pair: SmartPair;

    constructor(pool: SmartPool) {
        // this.trade = trade;
        this.pool = pool;
        // this.pair = pair;

        async function getTradefromAmounts(poolA: SmartPool, poolB: SmartPool) {
            let higher = BN.max((amountOutA), (amountOutB))
            let lower = BN.min((amountOutA), (amountOutB))
            let greater = BN.max((a0), (b0))
            let lesser = BN.min((a0), (b0))

            let difference = higher.minus(lower)
            let differencePercent = (difference.div(higher)).multipliedBy(100)

            let B0 = lower == BN(a1) && greater == BN(a0) //flashing from A1 to B0
            let A1 = higher.eq(amountOutA) //&& greater == BN(a0) //flashing from A0 to B1
            let B1 = higher.eq(amountOutB) //&& greater == BN(b0) //flashing from B0 to A1
            let A0 = lower == BN(b1) && greater == BN(b0) //flashing from B1 to A0

            var direction = B1 ? "B1" : A1 ? "A1" : "DIRECTIONAL AMBIGUITY ERROR"
            // var direction: any = B0 ? "B0" : B1 ? "B1" : A1 ? "A1" : A0 ? "A0" : "DIRECTIONAL AMBIGUITY ERROR"

            var trade: BoolTrade = {
                direction: direction,
                loanPool: {
                    exchange: A1 ? exchangeB : exchangeA,
                    poolID: A1 ? poolB_id : poolA_id,
                    amountOut: A1 ? amountOutB : amountOutA,
                    amountOutjs: A1 ? amountOutBjs : amountOutAjs,
                    amountRepay: A1 ? amountRepayB : amountRepayA,
                    amountRepayjs: A1 ? amountRepayBjs : amountRepayAjs,
                    tokenOutPrice: A1 ? bPrice1BN : aPrice1BN,
                    reserveIn: A1 ? bReserveInBN : aReserveInBN,
                    reserveInjs: A1 ? bReserveIn : aReserveIn,
                    reserveOut: A1 ? bReserveOutBN : aReserveOutBN,
                    reserveOutjs: A1 ? bReserveOut : aReserveOut,
                    factoryID: A1 ? factoryB_id : factoryA_id,
                    routerID: A1 ? routerB_id : routerA_id,
                },
                recipient: {
                    exchange: A1 ? exchangeA : exchangeB,
                    poolID: A1 ? poolA_id : poolB_id,
                    amountOut: A1 ? amountOutA : amountOutB,
                    amountOutjs: A1 ? amountOutAjs : amountOutBjs,
                    amountRepay: A1 ? amountRepayA : amountRepayB,
                    amountRepayjs: A1 ? amountRepayAjs : amountRepayBjs,
                    tokenOutPrice: A1 ? aPrice1BN : bPrice1BN,
                    reserveIn: A1 ? aReserveInBN : bReserveInBN,
                    reserveInjs: A1 ? aReserveIn : bReserveIn,
                    reserveOut: A1 ? aReserveOutBN : bReserveOutBN,
                    reserveOutjs: A1 ? aReserveOut : bReserveOut,
                    routerID: A1 ? routerA_id : routerB_id,
                    factoryID: A1 ? factoryA_id : factoryB_id,
                },
            }

            // return trade
        }
    }
}