
import { BigNumber } from 'ethers';

export async function getAmountsOut(amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
    const amountInWithFee = amountIn.mul(997);
    const numerator = amountInWithFee.mul(reserveOut);
    const denominator = reserveIn.mul(1000).add(amountInWithFee);
    const amountOut = numerator.div(denominator);
    return amountOut;
}

//amountIn = amountOut * reserveIn / (reserveOut - amountOut)
export async function getAmountsIn(amountOut: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
    const numerator = reserveIn.mul(amountOut).mul(1000);
    const denominator = reserveOut.sub(amountOut).mul(997);
    const amountIn = numerator.div(denominator).add(1);
    return amountIn;
}
