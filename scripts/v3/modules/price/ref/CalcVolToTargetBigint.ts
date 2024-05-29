import { IRL, InRangeLiquidity } from '../../../classes/InRangeLiquidity';
import { LiquidityMath, Pool, SwapMath, TickMath } from "@uniswap/v3-sdk";
import { ERC20token, PoolInfo, PoolStateV3, Slot0 } from '../../../../../constants/interfaces';
import { abi as IUniswapV3PoolState } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json';
import { abi as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { abi as IAlgebraPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json';
import { abi as IAlgebraPoolState } from '@cryptoalgebra/core/artifacts/contracts/interfaces/pool/IAlgebraPoolState.sol/IAlgebraPoolState.json';
import { ethers, Contract } from 'ethers';
import { ExchangeMapV3, uniswapV3Exchange } from '../../../../../constants/addresses';
import { provider } from '../../../../../constants/provider';
import { pu } from '../../../../modules/convertBN';
import { error } from 'console';
import { BigNumber as BN } from 'bignumber.js'

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
// contract - the this.pool's contract
// sCurrentPrice - sqrt of the current price
// sPriceTarget - sqrt of the target price
// liquidity - the liquidity in the current tick range of the this.pool
// tickLower, tickUpper - the min and max ticks of the current tick range
// sPriceUpper, sPriceUpper - square roots of prices corresponding to the min and max ticks of the current range
// tickSpacing - the tick spacing in the this.pool.
// 	decimalsX, decimalsY - the bigint of decimals of the X and Y tokens, for printing the result
export class VolToTarget {
	exchange: string
	token0: ERC20token
	token1: ERC20token
	pool: Contract
	data: InRangeLiquidity
	sPriceTarget: bigint

	constructor(exchange: string, token0: ERC20token, token1: ERC20token, pool: Contract, data: InRangeLiquidity, sPriceTarget: bigint) {
		this.exchange = exchange
		this.token0 = token0
		this.token1 = token1
		this.pool = pool
		this.data = data
		this.sPriceTarget = sPriceTarget
	}


	//  amount of x in range; 
	// sp = sPriceCurrent, sb = sPriceUpper
	x_in_range(L: bigint, sp: bigint, sb: bigint) {
		return L * (sb - sp) / (sp * sb)
	}

	//  amount of y in range; 
	// sp = sPriceCurrent, sa = sPriceLower
	y_in_range(L: bigint, sp: bigint, sa: bigint) {
		return L * (sp - sa)
	}

	tick_to_price(tick: bigint) {
		const t = BN(tick.toString())
		let p = BN(1.0001).pow(t)
		return BigInt(p.toString())
		//return 1.0001 ** t
	}

	async calcVolToTarget(): Promise<bigint> {
		const s = await this.data.getIRLbigint()
		const s0 = await this.data.getSlot0()
		let sPriceCurrent = (s.sqrtPrice)
		let sPriceLower = (s.sqrtRatioLow)
		let sPriceUpper = (s.sqrtRatioHigh)
		let liquidity = (s.liquidity)
		let tickLower = (s.tickLow)
		let tickUpper = (s.tickHigh)



		// Using only available liquidity in the current tick range
		// //  how much of X or Y tokens we need to * buy * to get to the target price ?
		let deltaTokens = 0n
		let x = 0n
		let delta: bigint = 0n

		// If the target price is not in the current tick range, use all the liquidity in the range
		if (this.sPriceTarget < sPriceLower || this.sPriceTarget > sPriceUpper) {
			return BigInt(liquidity)
		}

		// If the target price is in the current tick range, calculate the required liquidity
		if (this.sPriceTarget > sPriceCurrent) {
			x = this.x_in_range(liquidity, sPriceCurrent, this.sPriceTarget)
		} else {
			x = this.y_in_range(liquidity, sPriceCurrent, this.sPriceTarget)
		}

		delta = BigInt(x)
		return delta
	}
}
