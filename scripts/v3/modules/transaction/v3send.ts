//import { ethers } from 'ethers';
//import { signer } from '../../../../constants/provider';
//import { logger } from '../../../../constants/logger';
//import { flashV3Multi } from '../../../../constants/environment';
//import { abi as IERC20 } from '@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json';
//import { Bool3Trade } from '../../../../constants/interfaces';
//export interface FlashParams {
//	token0: string
//	token1: string
//	fee1: number
//	amount0: bigint
//	amount1: bigint
//	fee2: number
//}



//export async function v3Send(trade: Bool3Trade) {

//	let flashParams = {
//		token0: trade.tokenIn.id,
//		token1: trade.tokenOut.id,
//		fee1: trade.loanPool.feeTier,
//		amount0: trade.target.tradeSize,
//		amount1: trade.target.amountOut,
//		fee2: trade.target.feeTier
//	}

//	let flash = await flashV3Multi.initFlash(flashParams);
//	let flashReceipt = await flash.wait(1);

//}



////// import { V3FlashParams } from '../../../constants/interfaces';

////interface V3FlashParams {
////	token0: string;
////	token1: string;
////	amount0: bigint;
////	amount1: bigint;
////	fee: number;
////	target: string;
////	deadline: number;
////	sqrtPriceLimitX96: bigint;
////	maxFlashSwapFee: bigint;
////	flashFee: bigint;
////	uniswapV3Pool1: string;
////	uniswapV3PoolKey1: string;
////	uniswapV3Fee1: number;
////	uniswapV3TickLower1: number;
////	uniswapV3TickUpper1: number;
////	uniswapV3Pool2: string;
////	uniswapV3PoolKey2: string;
////	uniswapV3Fee2: number;
////	uniswapV3TickLower2: number;
////	uniswapV3TickUpper2: number;
////}

////export async function simulateArbitrage(params: V3FlashParams): Promise<void> {
////	// Get the current balances of the tokens
////	const token0 = new ethers.Contract(params.token0, IERC20, provider);
////	const token1 = new ethers.Contract(params.token1, IERC20, provider);
////	// const balance0Before = await token0.balanceOf(wallet.getAddress());
////	// const balance1Before = await token1.balanceOf(wallet.getAddress());

////	// Call the initFlash function to start the flash swap
////	const flashTx = await flashV3.initFlash(params);

////	// Wait for the flash swap to complete
////	const flashReceipt = await flashTx.wait(1);

////	// Decode the callback data from the flash swap
////	// const callbackData = ethers.defaultAbiCoder.decode(['bytes'], flashReceipt.logs[0].data)[0];
////	// const decodedData = ethers.defaultAbiCoder.decode(['tuple(uint256,uint256,bytes)'], callbackData)[0].data;

////	// Call the uniswapV3FlashCallback function with the decoded callback data
////	// const callbackTx = await flashV3.uniswapV3FlashCallback(decodedData);

////	// Wait for the callback to complete
////	await callbackTx.wait();

////}