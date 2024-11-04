import JSBI from "jsbi";
import { ERC20token, Slot0, PoolInfo } from "../../../../constants/interfaces";

export interface IRLJSBI {
    pool: string;
    fee: JSBI;
    exchange: string;
    sqrtRatioLow: JSBI;
    sqrtRatioHigh: JSBI;
    sqrtPrice: JSBI;
    price0: JSBI;
    price1: JSBI;
    liquidity: JSBI;
    tickLow: JSBI;
    tickHigh: JSBI;
    tickSpacing: JSBI;
    reserves0: JSBI;
    reserves1: JSBI;
}

export async function getIRLJSBI(
    s0: Slot0,
    poolInfo: PoolInfo,
    token0: ERC20token,
    token1: ERC20token,
    liquidity: JSBI,
): Promise<IRLJSBI> {
    let r0 = JSBI.BigInt(0);
    let r1 = JSBI.BigInt(0);

    const sqrtPriceX96 = JSBI.BigInt(s0.sqrtPriceX96.toString());
    const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
    const sp = JSBI.divide(JSBI.multiply(sqrtPriceX96, Q96), Q96);

    let ct = JSBI.BigInt(s0.tick.toString());
    let tickSpacing = JSBI.BigInt(poolInfo.tickSpacing.toString());

    // Can be used to isolate the range of ticks to calculate liquidity for
    let tLow: JSBI = JSBI.multiply(JSBI.divide(ct, tickSpacing), tickSpacing);
    let tUp: JSBI = JSBI.add(
        JSBI.multiply(JSBI.divide(ct, tickSpacing), tickSpacing),
        tickSpacing,
    );

    // This is a range of ticks that represent a percentage controlled by slippage
    let spLow = JSBI.exponentiate(JSBI.BigInt(1.0001 * 10 ** 18), tLow);
    let spHigh = JSBI.exponentiate(JSBI.BigInt(1.0001 * 10 ** 18), tUp);

    let L = JSBI.BigInt(liquidity.toString());

    let r: IRLJSBI = {
        pool: token0.symbol + "/" + token1.symbol,
        fee: JSBI.BigInt(poolInfo.fee.toString()),
        exchange: poolInfo.exchange,
        sqrtRatioLow: JSBI.divide(
            JSBI.BigInt(Math.sqrt(Number(spLow))),
            JSBI.BigInt(10 ** 9),
        ),
        sqrtRatioHigh: JSBI.divide(
            JSBI.BigInt(Math.sqrt(Number(spHigh))),
            JSBI.BigInt(10 ** 9),
        ),
        sqrtPrice: sp,
        price0: JSBI.BigInt(0),
        price1: JSBI.BigInt(0),
        liquidity: L,
        tickLow: tLow,
        tickHigh: tUp,
        tickSpacing: tickSpacing,
        reserves0: r0,
        reserves1: r1,
    };

    return r;
}
