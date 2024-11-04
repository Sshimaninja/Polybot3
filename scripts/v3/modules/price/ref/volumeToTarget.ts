import { IRL, InRangeLiquidity } from "../../../classes/IRL";
import { LiquidityMath, Pool, SwapMath, TickMath } from "@uniswap/v3-sdk";
import { Slot0 } from "../../../../../constants/interfaces";
import { ethers } from "ethers";
import JSBI from "jsbi";
("/root/polybotv3/node_modules/@uniswap/sdk-core/node_modules/jsbi/jsbi");
export async function volumeToReachTargetPrice(
    pool: IRL,
    IRL: InRangeLiquidity,
    isDirection0For1: boolean,
    sMaxPriceTarget: bigint,
): Promise<{ amountIn: bigint; amountOut: bigint }> {
    let deltaTokenIn: JSBI = JSBI.BigInt(0);
    let deltaTokenOut: JSBI = JSBI.BigInt(0);

    const tickSpacing = pool;

    let slot0: Slot0 = await IRL.getSlot0();
    let liquidity: JSBI = (await IRL.getIRL()).liquidity;
    let sPriceCurrent: JSBI = slot0.sqrtPriceX96;

    let JSBIsPriceCurrent: JSBI = JSBI.BigInt(sPriceCurrent.toString());

    let lowerTick = pool.tickHigh;
    let upperTick = pool.tickLow;

    let nextTick: number = lowerTick;
    let limitTick: number = upperTick;

    const direction = -1;
    while (nextTick != limitTick) {
        const nextPrice = getNextPrice(nextTick);
        const [sqrtPriceX96, JSBIamountIn, JSBIamountOut, JSBIfeeAmount] =
            SwapMath.computeSwapStep(
                JSBI.BigInt(sPriceCurrent.toString()),
                JSBI.BigInt(nextPrice),
                JSBI.BigInt(liquidity.toString()),
                JSBI.BigInt(ethers.MaxInt256.toString()),
                pool.fee,
            );
        const [amountIn, amountOut, feeAmount] = [
            JSBI.BigInt(JSBIamountIn.toString()),
            JSBI.BigInt(JSBIamountOut.toString()),
            JSBI.BigInt(JSBIfeeAmount.toString()),
        ];

        deltaTokenIn = JSBI.add(deltaTokenIn, JSBI.add(amountIn, feeAmount));
        deltaTokenOut = JSBI.add(deltaTokenOut, amountOut);

        sPriceCurrent = JSBI.BigInt(sqrtPriceX96.toString());

        let reserves: IRL = pool;
        let normalizedLiquidityNet = isDirection0For1
            ? -reserves.reserves0
            : reserves.reserves1;

        liquidity = JSBI.add(
            liquidity,
            JSBI.BigInt(normalizedLiquidityNet.toString()),
        );

        nextTick = nextTick + Number(tickSpacing) * direction;
    }
    return {
        amountIn: BigInt(deltaTokenIn.toString()),
        amountOut: BigInt(deltaTokenOut.toString()),
    };
}

function getNextPrice(nextTick: number): number {
    const nextPriceTarget = TickMath.getSqrtRatioAtTick(nextTick);
    // Convert JSBI to bigint
    const nextPriceTargetNum: number = Number(nextPriceTarget.toString());
    return nextPriceTargetNum;
}
