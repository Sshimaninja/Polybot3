import { IRL, InRangeLiquidity, V3Reserves } from '../inRangeLiquidity';
import { LiquidityMath, Pool, SwapMath, TickMath } from "@uniswap/v3-sdk";
import { ERC20token, PoolInfo, PoolStateV3, Slot0 } from '../../../../../constants/interfaces';
import { abi as IUniswapV3PoolState } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json';
import { abi as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { abi as IAlgebraPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json';
import { ethers, Contract } from 'ethers';
import { ExchangeMapV3, uniswapV3Exchange } from '../../../../../constants/addresses';
import { provider } from '../../../../../constants/provider';
import { pu } from '../../../../modules/convertBN';
import { error } from 'console';

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
// contract - the this.pool's contract
// sCurrentPrice - sqrt of the current price
// sPriceTarget - sqrt of the target price
// liquidity - the liquidity in the current tick range of the this.pool
// tickLower, tickUpper - the min and max ticks of the current tick range
// sPriceUpper, sPriceUpper - square roots of prices corresponding to the min and max ticks of the current range
// tickSpacing - the tick spacing in the this.pool.
// 	decimalsX, decimalsY - the number of decimals of the X and Y tokens, for printing the result
export class VolToTarget {
	exchange: string
	token0: ERC20token
	token1: ERC20token
	pool: Contract
	data: InRangeLiquidity
	sPriceTarget: number

	constructor(exchange: string, token0: ERC20token, token1: ERC20token, pool: Contract, data: InRangeLiquidity, sPriceTarget: number) {
		this.exchange = exchange
		this.token0 = token0
		this.token1 = token1
		this.pool = pool
		this.data = data
		this.sPriceTarget = sPriceTarget
	}


	//  amount of x in range; 
	// sp = sPriceCurrent, sb = sPriceUpper
	x_in_range(L: number, sp: number, sb: number) {
		return L * (sb - sp) / (sp * sb)
	}

	//  amount of y in range; 
	// sp = sPriceCurrent, sa = sPriceLower
	y_in_range(L: number, sp: number, sa: number) {
		return L * (sp - sa)
	}

	tick_to_price(tick: number) {
		return 1.0001 ** tick
	}

	async calcVolToTarget(): Promise<bigint> {
		const s = await this.data.getReserves()
		const s0 = await this.data.getSlot0()
		let sPriceCurrent = Number(s.sqrtPrice)
		let sPriceLower = Number(s.sqrtRatioLow)
		let sPriceUpper = Number(s.sqrtRatioHigh)
		let liquidity = Number(s.liquidity)
		let tickLower = Number(s.tickLow)
		let tickUpper = Number(s.tickHigh)


		// //  how much of X or Y tokens we need to * buy * to get to the target price ?
		let deltaTokens = 0
		let x = 0
		let delta: bigint = 0n
		let nextTickRange: any
		let currentTickRange: any

		// The Trade class logic makes it always so that the target price is higher than the current price
		// The logic below is for the opposite case, when the target price is lower than the current price
		// if (sPriceCurrent < this.sPriceTarget) {
		// 	console.log("targetPool priceOut is already lower than the target price")
		// 	return 0n
		// }
		// IF WE WANT TO USE LIQUIDITY INSTEAD OF PRICE TO DETERMINE DIRECTION, WE CAN WRAP OUR HEADS AROUND THIS:

		//  too few Y in the this.pool; we need to buy some X to increase amount of Y in this.pool
		try {
			if (this.sPriceTarget > sPriceCurrent) {
				if (this.sPriceTarget > sPriceUpper) {
					//  not in the current price range; use all X in the range
					x = this.x_in_range(liquidity, sPriceCurrent, sPriceUpper)

					deltaTokens += x
					nextTickRange = await this.pool.ticks(BigInt(tickUpper))
					liquidity += Number(nextTickRange[1])
					// adjust the price and the range limits
					sPriceCurrent = sPriceUpper
					tickLower = tickUpper
					tickUpper += s.tickSpacing
					sPriceLower = sPriceUpper
					sPriceUpper = this.tick_to_price(tickUpper / 2)
				} else {
					// in the current price range
					x = this.x_in_range(liquidity, sPriceCurrent, this.sPriceTarget)
					deltaTokens += x
					sPriceCurrent = this.sPriceTarget

				}
				console.log("token0 tradeSize: ", (deltaTokens / 10 ** this.token0.decimals), "from ", uniswapV3Exchange[this.exchange].protocol)
				// console.log("fixedNumber: ", deltaTokens.toFixed(this.token0.decimals))
				delta = BigInt(deltaTokens)
				return delta
			}
		} catch (e: any) {
			if (e.code === 'BAD_DATA') {
				console.log("Protocol: ", uniswapV3Exchange[this.exchange].protocol)
				// console.log("Error: ", e)
				// return 0n
			}
			console.log('tickUpper: ', tickUpper)
			console.log(e.code)
		}
		try {
			if (sPriceCurrent < this.sPriceTarget) {
				// 	return 0n
				// }
				while (this.sPriceTarget < sPriceCurrent) {
					if (this.sPriceTarget < sPriceLower) {
						//  not in the current price range; use all Y in the range
						deltaTokens += this.y_in_range(liquidity, sPriceCurrent, sPriceLower)
						//  query the blockchain for liquidity in the previous tick range
						currentTickRange = await this.pool.ticks(tickLower)
						liquidity -= Number(currentTickRange[1])
						// adjust the price and the range limits
						sPriceCurrent = sPriceLower
						tickUpper = tickLower
						tickLower -= Number(s.tickSpacing)
						sPriceUpper = sPriceLower
						sPriceLower = this.tick_to_price(tickLower / 2)
						currentTickRange = await this.pool.ticks(BigInt(tickLower))
					} else {
						// in the current price range
						let y = this.y_in_range(liquidity, sPriceCurrent, this.sPriceTarget)
						deltaTokens += y
						sPriceCurrent = this.sPriceTarget
					}
					console.log("token1 tradeSize: ", (deltaTokens / 10 ** this.token1.decimals), "from ", uniswapV3Exchange[this.exchange].protocol)
					// console.log("fixedNumber: ", deltaTokens.toFixed(this.token1.decimals))
					delta = BigInt(deltaTokens)
					return delta
				}
			}
		} catch (e: any) {
			if (e.code === 'BAD_DATA') {
				console.log("Protocol: ", uniswapV3Exchange[this.exchange].protocol)
				// console.log("Error: ", e)
				// return 0n
			}
			console.log('tickLower: ', tickLower)
			console.log(e.code)
		}
		return delta
	}
}
