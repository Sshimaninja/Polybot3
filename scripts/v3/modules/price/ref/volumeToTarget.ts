import { IRL, InRangeLiquidity, V3Reserves } from '../inRangeLiquidity';
import { LiquidityMath, Pool, SwapMath, TickMath } from "@uniswap/v3-sdk";
import { Slot0 } from '../../../../../constants/interfaces';
import { ethers } from 'ethers';
import JSBI from '/root/polybotv3/node_modules/@uniswap/sdk-core/node_modules/jsbi/jsbi';
export async function volumeToReachTargetPrice(
	pool: IRL,
	IRL: InRangeLiquidity,
	// isDirection0For1: boolean,
	sMaxPriceTarget: bigint
): Promise<{ amountIn: bigint; amountOut: bigint }> {
	let deltaTokenIn: bigint = BigInt(0);
	let deltaTokenOut: bigint = BigInt(0);

	const tickSpacing = pool;

	let slot0: Slot0 = await IRL.getSlot0();
	let liquidity: bigint = slot0.liquidity;
	let sPriceCurrent: bigint = slot0.sqrtPriceX96;

	let JSBIsPriceCurrent: JSBI = JSBI.BigInt(sPriceCurrent.toString());

	let lowerTick = pool.tickHigh;
	let upperTick = pool.tickLow;

	let nextTick = lowerTick;
	let limitTick = upperTick;

	const direction = -1;
	while (nextTick != limitTick) {
		const nextPrice = getNextPrice(nextTick);
		const [sqrtPriceX96, JSBIamountIn, JSBIamountOut, JSBIfeeAmount] = SwapMath.computeSwapStep(
			JSBI.BigInt(sPriceCurrent.toString()),
			JSBI.BigInt(nextPrice),
			JSBI.BigInt(liquidity.toString()),
			JSBI.BigInt(ethers.MaxInt256.toString()),
			pool.fee
		);
		const [amountIn, amountOut, feeAmount] = [BigInt(JSBIamountIn.toString()), BigInt(JSBIamountOut.toString()), BigInt(JSBIfeeAmount.toString())];

		deltaTokenIn += amountIn + feeAmount;
		deltaTokenOut += amountOut;

		sPriceCurrent = BigInt(sqrtPriceX96.toString());

		let reserves: IRL = await pool.getReserves();
		let normalizedLiquidityNet = isDirection0For1
			? -reserves.reservesWei0
			: reserves.reservesWei1;

		liquidity += normalizedLiquidityNet;

		nextTick = nextTick + tickSpacing * direction;
	}
	return { amountIn: deltaTokenIn, amountOut: deltaTokenOut };
}

function getNextPrice(nextTick: number): number {
	const nextPriceTarget = TickMath.getSqrtRatioAtTick(nextTick);
	// Convert JSBI to bigint
	const nextPriceTargetNum: number = Number(nextPriceTarget.toString());
	return nextPriceTargetNum;

}