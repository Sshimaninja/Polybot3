import { IRL, InRangeLiquidity, V3Reserves } from '../../../classes/InRangeLiquidity';
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

export async function getTicks(tick: number, poolID: string): Promise<void> {
	const pool = new Contract(poolID, IAlgebraPool, provider)
	const isPool = await pool.getAddress()
	if (!isPool) {
		console.log('Pool does not exist')
		return
	}
	const unlocked = await pool.unlocked()
	if (!unlocked) {
		console.log('Pool is locked')
		return
	}
	const ticks = await pool.ticks(tick)
	return ticks
}
