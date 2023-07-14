import { BigNumber as BN } from "bignumber.js";
import { BigNumber } from "ethers";
import { Trade } from "../../constants/interfaces"
export async function getDirection(
    token0ID: string,
    token0symbol: string,
    token0dec: number,
    token1ID: string,
    token1symbol: string,
    token1dec: number,
    amountIn: BN,
    amountOutA: BN,
    amountOutAjs: BigNumber,
    amountOutB: BN,
    amountOutBjs: BigNumber,
    amountRepayA: BN,
    amountRepayAjs: BigNumber,
    amountRepayB: BN,
    amountRepayBjs: BigNumber,
    aPrice0BN: BN,
    bPrice0BN: BN,
    aPrice1BN: BN,
    bPrice1BN: BN,
    aReserve0BN: BN,
    aReserve1BN: BN,
    aReserve0: BigNumber,
    aReserve1: BigNumber,
    bReserve0BN: BN,
    bReserve1BN: BN,
    bReserve0: BigNumber,
    bReserve1: BigNumber,
    exchangeA: string,
    exchangeB: string,
    poolA_id: string,
    poolB_id: string,
    factoryA_id: string,
    factoryB_id: string,
    routerA_id: string,
    routerB_id: string,
) {
    let higher = BN.max((amountOutA), (amountOutB))
    let lower = BN.min((amountOutA), (amountOutB))
    let greater = BN.max((aReserve0BN), (bReserve0BN))
    let lesser = BN.min((aReserve0BN), (bReserve0BN))

    let difference = higher.minus(lower)
    let differencePercent = (difference.div(higher)).multipliedBy(100)

    let B0 = higher.eq(BN(amountOutA)) && greater.eq(BN(aReserve0BN)) //flashing from A1 to B0
    let B1 = higher.eq(BN(amountOutB)) && greater.eq(BN(aReserve0BN)) //flashing from A0 to B1

    let A1 = higher.eq(BN(amountOutA)) && greater.eq(BN(bReserve0BN)) //flashing from B0 to A1
    let A0 = higher.eq(BN(amountOutB)) && greater.eq(BN(bReserve0BN)) //flashing from B1 to A0

    var direction: any = B0 ? "B0" : B1 ? "B1" : A1 ? "A1" : A0 ? "A0" : "DIRECTIONAL AMBIGUITY ERROR"

    var trade: Trade = {
        direction: direction,
        tokenInsymbol: A1 || B1 ? token0symbol : token1symbol,
        tokenInPrice: B1 ? aPrice0BN : B0 ? aPrice1BN : A0 ? bPrice1BN : bPrice0BN,
        tokenInID: A1 || B1 ? token0ID : token1ID,
        tokenIndec: A1 || B1 ? token0dec : token1dec,
        tokenOutsymbol: A1 || B1 ? token1symbol : token0symbol,
        tokenOutPrice: B1 ? bPrice1BN : B0 ? bPrice0BN : A0 ? aPrice0BN : aPrice1BN,
        tokenOutID: A1 || B1 ? token1ID : token0ID,
        tokenOutdec: A1 || B1 ? token1dec : token0dec,
        amountIn: amountIn,
        loanPool: {
            exchange: B0 || B1 ? exchangeA : exchangeB,
            poolID: B0 || B1 ? poolA_id : poolB_id,
            tokenInPrice: B1 ? aPrice0BN : B0 ? aPrice1BN : A0 ? bPrice1BN : bPrice0BN,
            tokenOutPrice: B1 ? aPrice1BN : B0 ? aPrice0BN : A0 ? bPrice0BN : bPrice1BN,
            reserveIn: B1 ? aReserve0BN : B0 ? aReserve1BN : A0 ? bReserve1BN : bReserve0BN,
            reserveInjs: B1 ? aReserve0 : B0 ? aReserve1 : A0 ? bReserve1 : bReserve0,
            reserveOut: B1 ? aReserve1BN : B0 ? aReserve0BN : A0 ? bReserve0BN : bReserve1BN,
            reserveOutjs: B1 ? aReserve1 : B0 ? aReserve0 : A0 ? bReserve0 : bReserve1,
            factoryID: B0 || B1 ? factoryA_id : factoryB_id,
            routerID: B0 || B1 ? routerA_id : routerB_id,
        },
        recipient: {
            exchange: B0 || B1 ? exchangeB : exchangeA,
            poolID: B0 || B1 ? poolB_id : poolA_id,
            tokenInPrice: B1 ? bPrice0BN : B0 ? bPrice1BN : A0 ? aPrice1BN : aPrice0BN,
            tokenOutPrice: B1 ? bPrice1BN : B0 ? bPrice0BN : A0 ? aPrice0BN : aPrice1BN,
            reserveIn: B1 ? bReserve0BN : B0 ? bReserve1BN : A0 ? aReserve1BN : aReserve0BN,
            reserveInjs: B1 ? bReserve0 : B0 ? bReserve1 : A0 ? aReserve1 : aReserve0,
            reserveOut: B1 ? bReserve1BN : B0 ? bReserve0BN : A0 ? aReserve0BN : aReserve1BN,
            reserveOutjs: B1 ? bReserve1 : B0 ? bReserve0 : A0 ? aReserve0 : aReserve1,
            routerID: B0 || B1 ? routerB_id : routerA_id,
            factoryID: B0 || B1 ? factoryB_id : factoryA_id,
        },
    }

    return trade
}