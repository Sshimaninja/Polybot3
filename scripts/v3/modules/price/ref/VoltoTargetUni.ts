import { TickMath } from "@uniswap/v3-sdk";

import { JSBI } from "@uniswap/sdk";
import { IUniswapV3Pool } from "../../../../../constants/interfaces";

export async function volumeToReachTargetPrice(
    pool: IUniswapV3Pool,
    isDirection0For1: boolean,
    targetPrice: JSBI,
) {
    let liquidity = pool.liquidity;

    let deltaTokenIn: JSBI = JSBI.BigInt(0);
    //let deltaTokenOut: JSBI = JSBI.BigInt(0);

    const tickSpacing = pool.tickSpacing;

    let sPriceCurrent: JSBI = pool.sqrtRatioX96;
    let { lowerTick, upperTick } = getTickBounds(pool.tick, tickSpacing);
    let tickRange = calculateTickRange(
        pool.tick,
        tickSpacing,
        targetPrice, // Add the 'as JSBI' type assertion here
    );

    const direction = isDirection0For1 ? -1 : 1;
    let nextTick = isDirection0For1 ? lowerTick : upperTick;
    const limitTick = isDirection0For1
        ? tickRange.lowerTick
        : tickRange.upperTick;
    while (nextTick != limitTick) {
        const nextPrice = JSBI.BigInt(
            TickMath.getSqrtRatioAtTick(nextTick).toString(),
        );
        const [sqrtPriceX96, amountIn, amountOut] = calculateSwapStep(
            sPriceCurrent,
            nextPrice,
            liquidity,
            pool.fee,
        );

        deltaTokenIn = JSBI.add(JSBI.add(deltaTokenIn, amountIn), amountOut);
        sPriceCurrent = sqrtPriceX96;

        const liquidityNet = JSBI.unaryMinus(
            JSBI.multiply(
                liquidity,
                JSBI.exponentiate(
                    JSBI.BigInt(2),
                    JSBI.BigInt(nextTick - pool.tick + 5),
                ),
            ),
        );
        liquidity = JSBI.add(liquidity, liquidityNet);

        nextTick = nextTick + tickSpacing * direction;
    }
    return { tradeSize: deltaTokenIn };
}
export function calculateTickRange(
    currentTick: number,
    poolSpacing: number,
    targetPrice: JSBI,
): { lowerTick: number; upperTick: number } {
    let { lowerTick, upperTick } = getTickBounds(currentTick, poolSpacing);
    let finalTick = TickMath.getTickAtSqrtRatio(targetPrice);
    let finalBounds = getTickBounds(finalTick, poolSpacing);

    return {
        lowerTick: Math.min(lowerTick, finalBounds.lowerTick),
        upperTick: Math.max(upperTick, finalBounds.upperTick),
    };
}

export function getTickBounds(
    tick: number,
    poolSpacing: number,
): { lowerTick: number; upperTick: number } {
    //Round towards negative infinity
    if (typeof tick !== "bigint") {
        console.log("tick: ", tick);
    }
    if (typeof poolSpacing !== "bigint") {
        console.log("poolSpacing: ", poolSpacing);
    }
    console.log("tick: ", tick);
    console.log("poolSpacing: ", poolSpacing);
    tick = Number(tick);
    let lowerTick = Math.floor(tick / poolSpacing) * poolSpacing;
    let upperTick = lowerTick + poolSpacing;
    return { lowerTick, upperTick };
}

function calculateSwapStep(
    sPriceCurrent: JSBI,
    nextPrice: JSBI,
    liquidity: JSBI,
    fee: number,
) {
    const amountIn = JSBI.multiply(
        liquidity,
        JSBI.divide(
            JSBI.subtract(nextPrice, sPriceCurrent),
            JSBI.add(nextPrice, sPriceCurrent),
        ),
    );
    const amountOut = JSBI.multiply(
        amountIn,
        JSBI.subtract(JSBI.BigInt(10000 - fee), JSBI.BigInt(10000)),
    );
    const sqrtPriceX96 = JSBI.divide(
        JSBI.add(
            JSBI.multiply(JSBI.add(sPriceCurrent, nextPrice), JSBI.BigInt(2)),
            JSBI.divide(
                JSBI.multiply(
                    JSBI.add(amountIn, amountOut),
                    JSBI.BigInt(997500),
                ),
                JSBI.BigInt(1995000000),
            ),
        ),
        JSBI.BigInt(10000),
    );
    return [sqrtPriceX96, amountIn, amountOut];
}
