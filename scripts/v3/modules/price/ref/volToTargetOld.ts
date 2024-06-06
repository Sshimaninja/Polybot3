
 async function volumeToReachTargetPriceOld(pool: ExtendedPool, provider: JsonRpcProvider) {
 	// how much of X or Y tokens we need to *buy* to get to the target price?
 	let deltaTokens: JSBI = JSBI.BigInt(0);
 	const tickSpacing = pool.tickSpacing;
 	let { lowerTick, upperTick } = getTickBounds(pool.tickCurrent, tickSpacing);
 	const decimalsX = pool.token0.decimals;
 	const decimalsY = pool.token1.decimals;
 	const contract = getPoolContract(pool.poolAddress, provider);
 	let liquidity = pool.liquidity;
 	let sPriceCurrent: JSBI = pool.sqrtRatioX96
 	let sPriceUpper: JSBI = TickMath.getSqrtRatioAtTick(upperTick);
 	let sPriceLower: JSBI = TickMath.getSqrtRatioAtTick(lowerTick);
 	const sPriceTarget: JSBI = JSBI.ADD(pool.sqrtRatioX96, 1);


 	// too few Y in the pool; we need to buy some X to increase amount of Y in pool

 	if (sPriceTarget > sPriceUpper) {
 		// not in the current price range; use all X in the range
 		const x = x_in_range(liquidity, sPriceCurrent, sPriceUpper)
 		deltaTokens = JSBI.ADD(deltaTokens, x);
 		// query the blockchain for liquidity in the next tick range

 		const nextTickRange = await contract.ticks(upperTick);
 		liquidity = JSBI.add(liquidity, JSBI.BigInt(nextTickRange.liquidityNet.toString()))
 		// adjust the price and the range limits
 		sPriceCurrent = sPriceUpper
 		lowerTick = upperTick
 		upperTick += tickSpacing
 		sPriceLower = sPriceUpper
 		sPriceUpper = TickMath.getSqrtRatioAtTick(upperTick)
 	}
 	else {
 		// in the current price range
 		const x = x_in_range(liquidity, sPriceCurrent, sPriceTarget)
 		deltaTokens = JSBI.ADD(deltaTokens, x);
 		sPriceCurrent = sPriceTarget
 	}
 }
 console.log(`need to buy ${JSBI.divide(deltaTokens, JSBI.BigInt(10 ** decimalsX)).toString()} X tokens`)
 	}
