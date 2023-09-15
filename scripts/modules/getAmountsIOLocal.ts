import { BigNumber } from 'ethers';

/**
 * Local calculation of amounts in/out 
 * @param amountIn 
 * @param reserveIn 
 * @param reserveOut 
 * @returns amountOut or amountIn
 */

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
    console.log({
        numerator: numerator.toString(),
        reserveIn: reserveIn.toString(),
        amountOut: amountOut.toString(),
    })
    console.log({
        reserveOut: reserveOut.toString(),
        amountOut: amountOut.toString(),
    })

    return BigNumber.from(0);//DEBUG
    // const denominator = reserveOut.sub(amountOut).mul(997);
    // const amountIn = numerator.div(denominator).add(1);
    // return amountIn;
}
