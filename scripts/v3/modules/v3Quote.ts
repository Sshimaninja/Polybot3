import { BigNumber, ethers, Contract } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as UniswapV3Quoter } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import { uniswapQuoter } from "../../../constants/addresses";
import { Match3Pools, PoolState } from "../../../constants/interfaces";
import { provider } from "../../../constants/contract";

// export async function getV3Quote(
// 	match: Match3Pools,
// 	state: PoolState,
// 	tradeSize: BigNumber
// ): Promise<BigNumber> {

const quoter = new Contract(uniswapQuoter.UNI, UniswapV3Quoter, provider);



//Returns the amount out received for a given exact input but for a swap of a single pool	
// function quoteExactInputSingle(
// 	address tokenIn,
// 	address tokenOut,
// 	uint24 fee,
// 	uint256 amountIn,
// 	uint160 sqrtPriceLimitX96
// ) external returns(uint256 amountOut)
export async function getAmountOutMax(
	match: Match3Pools,
	state: PoolState,
	tradeSize: BigNumber
): Promise<BigNumber> {
	const getAmountOutMax = quoter.quoteExactInputSingle(
		match.token0.id,
		match.token1.id,
		match.pool0.fee,
		tradeSize,
		state.sqrtPriceX96
	);
	return getAmountOutMax;
};


// Returns the amount in required to receive the given exact output amount
// 	function quoteExactOutputSingle(
// 		address tokenIn,
// 		address tokenOut,
// 		uint24 fee,
// 		uint256 amountOut,
// 		uint160 sqrtPriceLimitX96
// 	) external returns(uint256 amountIn)
export async function getAmountInMin(
	match: Match3Pools,
	state: PoolState,
	amountOutExpected: BigNumber
): Promise<BigNumber> {
	const getAmountInMin = quoter.quoteExactOutputSingle(
		match.token0.id,
		match.token1.id,
		match.pool0.fee,
		amountOutExpected,
		state.sqrtPriceX96
	);

	return getAmountInMin;
}