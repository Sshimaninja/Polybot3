import { Contract } from "ethers";

import { ERC20token, Slot0 } from "../../../../constants/interfaces";
import { V3Quote } from "./v3Quote";

//import { Prices } from './Prices';

export async function sqrtToPrice(
    sqrt: number,
    token0: ERC20token,
    token1: ERC20token,
    dir: boolean,
): Promise<number> {
    const numerator = sqrt ** 2;
    const denominator = 2 ** 192;
    let ratio = numerator / denominator;
    const shiftDecimals = Math.pow(10, token0.decimals - token1.decimals);
    ratio = ratio * shiftDecimals;
    if (!dir) {
        ratio = 1 / ratio;
    }
    return ratio;
}

export async function priceImpact(
    pool: Contract,
    q: V3Quote,
    slot: Slot0,
    tokenIn: ERC20token,
    tokenOut: ERC20token,
    amountIn: bigint,
    fee: number,
) {
    const token0 = await pool.token0();
    const token1 = await pool.token1();
    const dir = token0.id === tokenIn.id;

    let quote = await q.maxOut(amountIn);
    let sqrtPriceX96After = quote.sqrtPriceX96After;

    let price = await sqrtToPrice(
        Number(slot.sqrtPriceX96),
        token0,
        token1,
        dir,
    );
    let priceAfter = await sqrtToPrice(
        Number(sqrtPriceX96After),
        token0,
        token1,
        dir,
    );

    const absoluteChange = price - priceAfter;

    const prices = {
        price: price,
        priceAfter: priceAfter,
        absoluteChange: absoluteChange,
    };
    // console.log(prices)
}
