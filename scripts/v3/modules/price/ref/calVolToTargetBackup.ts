import { IRL, InRangeLiquidity, V3Reserves } from '../inRangeLiquidity';
import { LiquidityMath, Pool, SwapMath, TickMath } from "@uniswap/v3-sdk";
import { ERC20token, PoolInfo, PoolStateV3, Slot0 } from '../../../../../constants/interfaces';
import { abi as IUniswapV3PoolState } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json';
import { abi as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { ethers, Contract } from 'ethers';
import { ExchangeMapV3, uniswapV3Exchange } from '../../../../../constants/addresses';
import { provider } from '../../../../../constants/provider';


// //  amount of x in range; sp = sqrt of current price, sb = sqrt of max price
// def x_in_range(L, sp, sb):
// return L * (sb - sp) / (sp * sb)

// //  amount of y in range; sp = sqrt of current price, sa = sqrt of min price
// def y_in_range(L, sp, sa):
// return L * (sp - sa)

// def tick_to_price(tick):
// return 1.0001 ** tick
export interface ITick {
	liquidityGross: bigint
	liquidityNet: bigint
	feeGrowthOutside0X128: bigint
	feeGrowthOutside1X128: bigint
	tickCumulativeOutside: bigint
	secondsPerLiquidityOutsideX128: bigint
	secondsOutside: bigint
	initialized: boolean
}

export interface ATick {
	liquidityTotal: bigint
	liquidityDelta: bigint
	outerFeeGrowth0Token: bigint
	outerFeeGrowth1Token: bigint
	prevTick: bigint
	nextTick: bigint
	outerSecondsPerLiquidity: bigint
	outerSecondsSpent: bigint
	hasLimitOrders: boolean
}
// contract - the pool's contract
// sCurrentPrice - sqrt of the current price
// sPriceTarget - sqrt of the target price
// liquidity - the liquidity in the current tick range of the pool
// tickLower, tickUpper - the min and max ticks of the current tick range
// sPriceUpper, sPriceUpper - square roots of prices corresponding to the min and max ticks of the current range
// tickSpacing - the tick spacing in the pool.
// 	decimalsX, decimalsY - the number of decimals of the X and Y tokens, for printing the result
export async function volToTarget(
	exchange: string,
	token0: ERC20token,
	token1: ERC20token,
	pool: Contract,
	data: InRangeLiquidity,
	sPriceTarget: number,
): Promise<number> {

	//  amount of x in range; 
	// sp = sPriceCurrent, sb = sPriceUpper
	function x_in_range(L: number, sp: number, sb: number) {
		return L * (sb - sp) / (sp * sb)
	}

	//  amount of y in range; 
	// sp = sPriceCurrent, sa = sPriceLower
	function y_in_range(L: number, sp: number, sa: number) {
		return L * (sp - sa)
	}

	function tick_to_price(tick: number) {
		return 1.0001 ** tick
	}
	const s = await data.getReserves()
	const s0 = await data.getSlot0()
	let sPriceCurrent = Number(s.sqrtPrice)
	let sPriceLower = Number(s.sqrtRatioLow)
	let sPriceUpper = Number(s.sqrtRatioHigh)
	let liquidity = Number(s.liquidity)
	let tickLower = Number(s.tickLow)
	let tickUpper = Number(s.tickHigh)

	let ITick = {
		liquidityGross: 0n,
		liquidityNet: 0n,
		feeGrowthOutside0X128: 0n,
		feeGrowthOutside1X128: 0n,
		tickCumulativeOutside: 0n,
		secondsPerLiquidityOutsideX128: 0n,
		secondsOutside: 0n,
		initialized: false
	}
	let ATick = {
		liquidityTotal: 0n,
		liquidityDelta: 0n,
		outerFeeGrowth0Token: 0n,
		outerFeeGrowth1Token: 0n,
		prevTick: 0n,
		nextTick: 0n,
		outerSecondsPerLiquidity: 0n,
		outerSecondsSpent: 0n,
		hasLimitOrders: false,

	}

	// //  how much of X or Y tokens we need to * buy * to get to the target price ?
	let deltaTokens = 0
	let x = 0




	if (uniswapV3Exchange[exchange].protocol === 'UNIV3') {

		try {
			if (sPriceTarget > sPriceCurrent) {
				//  too few Y in the pool; we need to buy some X to increase amount of Y in pool
				if (sPriceTarget > sPriceCurrent) {
					if (sPriceTarget > sPriceUpper)
						//  not in the current price range; use all X in the range
						x = x_in_range(liquidity, sPriceCurrent, sPriceUpper)


					deltaTokens += x
					//  query the blockchain for liquidity in the next tick range
					let nextTickRange = await pool.ticks(s.tickHigh)
					liquidity += Number(nextTickRange.liquidityNet)
					// adjust the price and the range limits
					sPriceCurrent = sPriceUpper
					tickLower = tickUpper
					tickUpper += Number(s.tickSpacing)
					sPriceLower = sPriceUpper
					sPriceUpper = tick_to_price(tickUpper / 2)


				} else {
					// in the current price range
					x = x_in_range(liquidity, sPriceCurrent, sPriceTarget)
					deltaTokens += x
					sPriceCurrent = sPriceTarget
					console.log("need to buy {:.10f} X tokens: ", (deltaTokens / 10 ** token0.decimals))

				}
			}
		} catch (error: any) {
			// console.log('error: UNIV3 volToTarget(): ', error.reason)
		}
	}

	if (sPriceTarget < sPriceCurrent) {
		try {
			let currentTickRange: ITick = await pool.ticks(s0.tick)
			if (sPriceTarget < sPriceCurrent) {
				if (sPriceTarget < sPriceLower) {
					//  not in the current price range; use all Y in the range
					deltaTokens += y_in_range(liquidity, sPriceCurrent, sPriceLower)
					if (currentTickRange.liquidityNet == 0n) {
						//  query the blockchain for liquidity in the previous tick range
						currentTickRange = await pool.ticks(s.tickLow)
					}
					liquidity -= Number(currentTickRange.liquidityNet)
					// adjust the price and the range limits
					sPriceCurrent = sPriceLower
					tickUpper = tickLower
					tickLower -= Number(s.tickSpacing)
					sPriceUpper = sPriceLower
					sPriceLower = tick_to_price(tickLower / 2)
					currentTickRange = await pool.ticks(s.tickLow)
				} else {
					// in the current price range
					let y = y_in_range(liquidity, sPriceCurrent, sPriceTarget)
					deltaTokens += y
					sPriceCurrent = sPriceTarget
				}
				console.log("need to buy {:.10f} Y tokens: ", (deltaTokens / 10 ** token1.decimals))
			}
		} catch (error: any) {
			// console.log('error: UNIV3 volToTarget(): ', error.reason)
		}
	}


	if (uniswapV3Exchange[exchange].protocol === 'ALG') {
		try {
			if (sPriceTarget > sPriceCurrent) {
				//  too few Y in the pool; we need to buy some X to increase amount of Y in pool
				if (sPriceTarget > sPriceCurrent) {
					if (sPriceTarget > sPriceUpper)
						//  not in the current price range; use all X in the range
						x = x_in_range(liquidity, sPriceCurrent, sPriceUpper)


					deltaTokens += x
					//  query the blockchain for liquidity in the next tick range
					let nextTickRange = await pool.ticks(s.tickHigh)
					liquidity += Number(nextTickRange.liquidityNet)
					// adjust the price and the range limits
					sPriceCurrent = sPriceUpper
					tickLower = tickUpper
					tickUpper += Number(s.tickSpacing)
					sPriceLower = sPriceUpper
					sPriceUpper = tick_to_price(tickUpper / 2)


				} else {
					// in the current price range
					x = x_in_range(liquidity, sPriceCurrent, sPriceTarget)
					deltaTokens += x
					sPriceCurrent = sPriceTarget
					console.log("need to buy {:.10f} X tokens: ", (deltaTokens / 10 ** token0.decimals))

				}
			}
		} catch (error: any) {
			// console.log('error: ALG volToTarget(): ', error.reason)
		}
		if (sPriceTarget < sPriceCurrent) {
			console.log(s0.tick)
			try {
				let currentTickRange: ATick = await pool.ticks(s0.tick)
				if (sPriceTarget < sPriceCurrent) {
					if (sPriceTarget < sPriceLower) {
						//  not in the current price range; use all Y in the range
						deltaTokens += y_in_range(liquidity, sPriceCurrent, sPriceLower)
						if (currentTickRange.liquidityDelta == 0n) {
							//  query the blockchain for liquidity in the previous tick range
							currentTickRange = await pool.ticks(s.tickLow)
						}
						liquidity -= Number(currentTickRange.liquidityDelta)
						// adjust the price and the range limits
						sPriceCurrent = sPriceLower
						tickUpper = tickLower
						tickLower -= Number(s.tickSpacing)
						sPriceUpper = sPriceLower
						sPriceLower = tick_to_price(tickLower / 2)
						currentTickRange = await pool.ticks(s.tickLow)
					} else {
						// in the current price range
						let y = y_in_range(liquidity, sPriceCurrent, sPriceTarget)
						deltaTokens += y
						sPriceCurrent = sPriceTarget
					}
					console.log("need to buy {:.10f} Y tokens: ", (deltaTokens / 10 ** token1.decimals))
				}
			} catch (error: any) {
				// console.log('error: ALG volToTarget(): ', error.reason)
			}
		}
	}


	return deltaTokens
}