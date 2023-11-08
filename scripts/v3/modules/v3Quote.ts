import { BigNumber, ethers, Contract } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as UniswapV3Quoter } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import { uniswapQuoter } from "../../../constants/addresses";
import { Bool3Trade, Match3Pools, PoolState } from "../../../constants/interfaces";
import { provider, signer } from "../../../constants/contract";

// export async function getV3Quote(
// 	match: Match3Pools,
// 	state: PoolState,
// 	tradeSize: BigNumber
// ): Promise<BigNumber> {

const quoter = new Contract(uniswapQuoter.UNI, UniswapV3Quoter, signer);



//Returns the amount out received for a given exact input but for a swap of a single pool	
// function quoteExactInputSingle(
// 	address tokenIn,
// 	address tokenOut,
// 	uint24 fee,
// 	uint256 amountIn,
// 	uint160 sqrtPriceLimitX96
// ) external returns(uint256 amountOut)
export async function getAmountOutMax(
	tokenIn: string,
	tokenOut: string,
	feeTier: number,
	tradeSize: BigNumber,
	sqrtPriceLimitX96: BigNumber
): Promise<BigNumber> {
	const getAmountOutMax = quoter.quoteExactInputSingle(
		tokenIn,
		tokenOut,
		feeTier,
		tradeSize,
		sqrtPriceLimitX96,
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
	tokenIn: string,
	tokenOut: string,
	feeTier: number,
	amountOutExpected: BigNumber,
	sqrtPriceLimitX96: BigNumber,
): Promise<BigNumber> {
	const getAmountInMin = quoter.quoteExactOutputSingle(
		tokenIn,
		tokenOut,
		feeTier,
		amountOutExpected,
		sqrtPriceLimitX96,
	);

	return getAmountInMin;
}