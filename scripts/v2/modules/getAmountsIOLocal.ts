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
	//If reserves are low, rounding up to 1 to prevent division by 0, which keeps numbers the same becuase multiplication/division by 1 does not change the number
	// console.log("getAmountsIn: " + amountOut.toString() + " " + reserveIn.toString() + " " + reserveOut.toString())
	const numerator = reserveIn.mul(amountOut).mul(1000).gt(0) ? reserveIn.mul(amountOut).mul(1000) : BigNumber.from(1);
	// console.log("Numerator: " + numerator.toString())
	const denominator = reserveOut.sub(amountOut).mul(997).gt(0) ? reserveOut.sub(amountOut).mul(997) : BigNumber.from(1);
	// console.log("Denominator: " + denominator.toString())
	const amountIn = numerator.div(denominator).add(1);
	return amountIn;
}
