import { BigNumber } from 'ethers';
/**
 * Local calculation of amounts in/out 
 * @param amountIn 
 * @param reserveIn 
 * @param reserveOut 
 * @returns amountOut from amountIn
 */
export async function getAmountsOut(amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
	// amountIn * 997
	const amountInWithFee = amountIn.mul(997);
	// (amountInwithFee) * reserveOut
	const numerator = amountInWithFee.mul(reserveOut);
	// (reserveIn * 1000) + (amountInwithFee)
	const denominator = reserveIn.mul(1000).add(amountInWithFee);
	// (amountInwithFee * reserveOut) / (reserveIn + amountInwithFee)
	const amountOut = numerator.div(denominator);
	return amountOut;
}
/**
 * Local calculation of amounts in/out 
 * @param amountIn 
 * @param reserveIn 
 * @param reserveOut 
 * @returns the minimum output asset amount required to buy the given input asset amount (accounting for fees) given reserves.
 */
//amountIn = amountOut * reserveIn / reserveOut - amountOut
// 
export async function getAmountsIn(amountOut: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
	// reserveIn * amountOut
	const numerator = amountOut.mul(reserveIn).mul(1000);
	const denominator = reserveOut.mul(997).add(amountOut.mul(1000));
	return numerator.div(denominator);
}



//from https://github.com/Uniswap/v2-periphery/blob/master/contracts/libraries/UniswapV2Library.sol

// given an output amount of an asset and pair reserves, returns a required input amount of the other asset
// function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) internal pure returns(uint amountIn) {
// 	require(amountOut > 0, 'UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT');
// 	require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
//  uint numerator = reserveIn.mul(amountOut).mul(1000);
// 	uint denominator = reserveOut.sub(amountOut).mul(997);
// 	amountIn = (numerator / denominator).add(1);
// }
