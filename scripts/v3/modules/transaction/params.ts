import { Bool3Trade } from "../../../../constants/interfaces";
import { signer } from "../../../../constants/provider";
import { ethers } from "ethers";


export interface PSwap {
	routerAID: string;
	routerBID: string;
	tradeSize: bigint;
	amountOutA: bigint;
	path0: string[];
	path1: string[];
	to: string;
	deadline: number;
}

export interface Pv3Flash {
	tokenInID: string;
	tokenOutID: string;
	fee1: number;
	amountIn: bigint;
	amountOut: bigint;
	fee2: number;
}

export async function params(trade: Bool3Trade): Promise<{
	swap: Promise<ethers.ContractTransaction>;
	//swapParams: PSwap;
	flashParams: Pv3Flash;
}> {
	const d = Math.floor(Date.now() / 1000) + 60 * 1; // 1 minute
	//let p: PSwap = {
	//	routerAID: await trade.target.router.getAddress(), //high Output tokenIn to tokenOut
	//	routerBID: await trade.loanPool.router.getAddress(), //high Output tokenOut to tokenIn
	//	tradeSize: trade.target.tradeSize,
	//	amountOutA: trade.target.amountOut, //high Output tokenIn to tokenOut
	//	path0: [trade.tokenIn.data.id, trade.tokenOut.data.id],
	//	path1: [trade.tokenOut.data.id, trade.tokenIn.data.id],
	//	to: await signer.getAddress(),
	//	deadline: d,
	//};
	let pf: Pv3Flash = {
		tokenInID: trade.tokenIn.id,
		tokenOutID: trade.tokenOut.id,
		fee1: trade.loanPool.feeTier,
		amountIn: trade.target.tradeSize,
		amountOut: trade.target.amountOut,
		fee2: trade.target.feeTier,
	};
	let swap: Promise<ethers.ContractTransaction> =
		{} as Promise<ethers.ContractTransaction>;
	//if (trade.type == "single") {
	//	swap = trade.contract.swapSingle.populateTransaction(
	//		p.routerAID,
	//		p.routerBID,
	//		p.tradeSize,
	//		p.amountOutA,
	//		p.path0,
	//		p.path1,
	//		p.to,
	//		p.deadline,
	//		{
	//			Type: 2,
	//			gasLimit: trade.gas.gasEstimate,
	//			maxFeePerGas: trade.gas.maxFee,
	//			maxPriorityFeePerGas: trade.gas.maxPriorityFee,
	//		},
	//	);
	//}
	//if (trade.type == "multi") {
	//	swap = trade.contract.swapMulti.populateTransaction(
	//		p.routerAID,
	//		p.routerBID,
	//		p.tradeSize,
	//		p.amountOutA,
	//		p.path0,
	//		p.path1,
	//		p.to,
	//		p.deadline,
	//		{
	//			Type: 2,
	//			gasLimit: trade.gas.gasEstimate,
	//			maxFeePerGas: trade.gas.maxFee,
	//			maxPriorityFeePerGas: trade.gas.maxPriorityFee,
	//		},
	//	);
	//}

	/*
	
	/// @param params The parameters necessary for flash and the callback, passed in as FlashParams
	/// @notice Calls the pools flash function with data needed in `uniswapV3FlashCallback`
	function initFlash(FlashParams memory params) external {
		PoolAddress.PoolKey memory poolKey = PoolAddress.PoolKey({
			token0: params.token0,
			token1: params.token1,
			fee: params.fee1
		});
		IUniswapV3Pool pool = IUniswapV3Pool(
			PoolAddress.computeAddress(factory, poolKey)
		);
		// recipient of borrowed amounts
		// amount of token0 requested to borrow
		// amount of token1 requested to borrow
		// need amount0 and amount1 in callback to pay back pool
		// recipient of flash should be THIS contract
		pool.flash(
			address(this),
			params.amount0,
			params.amount1,
			abi.encode(
				FlashCallbackData({
					amount0: params.amount0,
					amount1: params.amount1,
					payer: msg.sender,
					poolKey: poolKey,
					poolFee2: params.fee2
				})
			)
		);
	}
	*/


	if (trade.type.includes("flash")) {
		const flashParams = {
			token0: pf.tokenInID,
			token1: pf.tokenOutID,
			fee1: pf.fee1,
			amount0: pf.amountIn,
			amount1: pf.amountOut,
			fee2: pf.fee2
		};
		swap = trade.contract.initFlash.populateTransaction(
			flashParams,
			{
				Type: 2,
				gasLimit: trade.gas.gasEstimate,
				maxFeePerGas: trade.gas.maxFee,
				maxPriorityFeePerGas: trade.gas.maxPriorityFee,
			},
		);
	}
	return { swap, flashParams: pf };
}
// function flashSwap(
//     address loanFactory,
//     address loanRouter,
//     address targetRouter,
//     address token0ID,
//     address token1ID,
//     uint256 amountIn,
//     uint256 amountOut,
//     uint256 amountToRepay
// ) external {
// key: 'flashSwap',
// args: [
//   '0xCf083Be4164828f00cAE704EC15a36D711491284',
//   '0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607',
//   '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
//   '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
//   '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
//   54897976877338564407n,
//   49646268824915942607n,
//   51739509899649324576n,
//   1712770840,
//   [Object]
// ]