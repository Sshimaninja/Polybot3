import { BigNumber } from 'ethers';
/**
 * Local calculation of amounts in/out 
 * @param amountIn 
 * @param reserveIn 
 * @param reserveOut 
 * @returns amountOut from amountIn
 */
export async function getAmountsOut(amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
	const amountInWithFee = amountIn.mul(997);
	const numerator = amountInWithFee.mul(reserveOut);
	const denominator = reserveIn.mul(1000).add(amountInWithFee);
	const amountOut = numerator.div(denominator);
	return amountOut;
}
/**
 * Local calculation of amounts in/out 
 * @param amountIn 
 * @param reserveIn 
 * @param reserveOut 
 * @returns the minimum input asset amount required to buy the given output asset amount (accounting for fees) given reserves.
 */
//amountIn = amountOut * reserveIn / (reserveOut - amountOut)
export async function getAmountsIn(amountOut: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
	// reserveIn * amountOut * 1000
	const numerator = reserveIn.mul(amountOut).mul(1000);
	// reserveOut = amountOut * 997
	const denominator = reserveOut.sub(amountOut).mul(997);
	// numerator / denominator + 1
	const amountIn = numerator.div(denominator).add(1);
	return amountIn;

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
