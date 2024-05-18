// import { Contract, ethers } from 'ethers';
// import { ReservesData, Slot0 } from '../../../../../constants/interfaces';
// import { InRangeLiquidity } from '../inRangeLiquidity';
// import JSBI from '@uniswap/sdk-core/node_modules/jsbi/jsbi';
// import { SwapMath, TickMath } from '@uniswap/v3-sdk';
// const MAX_UINT_256 = JSBI.BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");


// export function getTickBounds(tick: number, poolSpacing: number): { lowerTick: number, upperTick: number } {
// 	// const result: any = {}
// 	//Round towards negative infinity
// 	const lowerTick = Math.floor(tick / poolSpacing) * poolSpacing;
// 	const upperTick = result.lowerTick + poolSpacing;
// 	return { lowerTick, upperTick };
// }

// export function calculateTickRange(
// 	currentTick: number,
// 	poolSpacing: number,
// 	targetPrice: bigint)
// 	: {
// 		lowerTick: number,
// 		upperTick: number
// 	} {
// 	let { lowerTick, upperTick } = getTickBounds(currentTick, poolSpacing);
// 	let finalTick = TickMath.getTickAtSqrtRatio(JSBI.BigInt(targetPrice.toString()));
// 	let finalBounds = getTickBounds(finalTick, poolSpacing);

// 	return {
// 		lowerTick: Math.min(lowerTick, finalBounds.lowerTick),
// 		upperTick: Math.max(upperTick, finalBounds.upperTick)
// 	}
// }

// export async function volumeToReachTargetPrice(
// 	irl: InRangeLiquidity,
// 	isDirection0For1: boolean,
// 	// multicallContract: UniswapInterfaceMulticall,
// 	sMaxPriceTarget: bigint) {
// 	// how much of X or Y tokens we need to *buy* to get to the target price?
// 	let deltaTokenIn: JSBI = JSBI.BigInt(0);
// 	let deltaTokenOut: JSBI = JSBI.BigInt(0);

// 	const pool = await irl.getReserves();
// 	const s0 = await irl.getSlot0();
// 	const tickSpacing = pool.tickSpacing;

// 	let liquidity = pool.liquidity;
// 	let sPriceCurrent: bigint = BigInt(pool.sqrtPrice)
// 	let { lowerTick, upperTick } = { lowerTick: pool.tickLow, upperTick: pool.tickHigh }
// 	let tickRange = calculateTickRange(s0.tick, tickSpacing, sMaxPriceTarget);

// 	// const tickRangeResponse = await getTickRangeResponses(tickRange.lowerTick, tickRange.upperTick, pool, multicallContract);
// 	// const tickToResponseMap: { [key: string]: TickResponse } = {};
// 	// tickRangeResponse.returnData.map((data: any, i) => {
// 	// 	const key = tickRange.lowerTick + (i * tickSpacing);
// 	// 	tickToResponseMap[key] = data.returnData
// 	// });

// 	//if direction is 0 for 1 then the price direction should be decreasing
// 	let nextTick = isDirection0For1 ? lowerTick : upperTick;
// 	//the tick range bounds should reflect the tick bound of the price inclusive to overflow
// 	let limitTick = isDirection0For1 ? tickRange.lowerTick : tickRange.upperTick;
// 	console.log(`TC: ${s0.tick}, TL: ${lowerTick}, TU: ${upperTick}, TRL: ${tickRange.lowerTick} TRU: ${tickRange.upperTick}`);
// 	console.log(`is0For1: ${isDirection0For1} limit tick: ${limitTick}`);

// 	const direction = isDirection0For1 ? -1 : 1;
// 	while (nextTick != limitTick) {
// 		const nextPrice = getNextPrice(nextTick, isDirection0For1, sMaxPriceTarget);
// 		const [sqrtPriceX96, amountIn, amountOut, feeAmount]
// 			= SwapMath.computeSwapStep(JSBI.BigInt(sPriceCurrent.toString()), JSBI.BigInt(nextPrice.toString()), JSBI.BigInt(liquidity.toString()), MAX_UINT_256, pool.fee);

// 		//console.log(`amountIn=${amountIn} amountOut=${amountOut}`);
// 		//console.log(`  currentTick=${TickMath.getTickAtSqrtRatio(sPriceCurrent)} nextTick=${TickMath.getTickAtSqrtRatio(nextPrice)} `);

// 		deltaTokenIn = JSBI.ADD(JSBI.ADD(deltaTokenIn, amountIn), feeAmount);
// 		deltaTokenOut = JSBI.ADD(deltaTokenOut, amountOut);

// 		sPriceCurrent = sqrtPriceX96
// 		const { liquidityNet } = tickToResponseMap[nextTick];
// 		let normalizedLiquidityNet = JSBI.BigInt(liquidityNet.toString());
// 		if (isDirection0For1) {
// 			// if we're moving leftward, we interpret liquidityNet as the opposite sign
// 			// safe because liquidityNet cannot be type(int128).min
// 			normalizedLiquidityNet = JSBI.unaryMinus(normalizedLiquidityNet);
// 		}

// 		liquidity = LiquidityMath.addDelta(liquidity, normalizedLiquidityNet);

// 		nextTick = nextTick + (tickSpacing * direction);
// 	}
// 	return { amountIn: deltaTokenIn, amountOut: deltaTokenOut }
// }




// function getNextPrice(nextTick: number, isDirection0For1: boolean, sMaxPriceTarget: bigint) {
// 	const nextPriceTargetJSBI = TickMath.getSqrtRatioAtTick(nextTick);
// 	const nextPriceTarget = BigInt(nextPriceTargetJSBI.toString());
// 	// Verbose for readability
// 	if (isDirection0For1) {
// 		// If the Direction is 0 for 1 then the price should be decreasing
// 		// there for we want to take the larger price as 
// 		// (the least price will be beyond our target)
// 		return nextPriceTarget < sMaxPriceTarget ? nextPriceTarget : sMaxPriceTarget
// 	} else {
// 		// If the Direction is 1 for 0 then the price should be increasing
// 		// there for we want to take the lesser price as 
// 		// (the higher price will be beyond our target)
// 		return nextPriceTarget < sMaxPriceTarget ? sMaxPriceTarget : nextPriceTarget
// 		// return JSBI.greaterThan(nextPriceTarget, sMaxPriceTarget) ? sMaxPriceTarget : nextPriceTarget
// 	}
// }
