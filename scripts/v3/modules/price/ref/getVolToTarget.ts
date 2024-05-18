import { IRL, InRangeLiquidity, V3Reserves } from '../inRangeLiquidity';
import { LiquidityMath, Pool, SwapMath, TickMath } from "@uniswap/v3-sdk";
import { Bool3Trade, ERC20token, PoolInfo, PoolStateV3, Slot0 } from '../../../../../constants/interfaces';
import { abi as IUniswapV3PoolState } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json';
import { abi as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { abi as IAlgebraPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json';
import { abi as IAlgebraPoolState } from '@cryptoalgebra/core/artifacts/contracts/interfaces/pool/IAlgebraPoolState.sol/IAlgebraPoolState.json';
import { ethers, Contract } from 'ethers';
import { ExchangeMapV3, uniswapV3Exchange } from '../../../../../constants/addresses';
import { provider } from '../../../../../constants/provider';
import { pu } from '../../../../modules/convertBN';
import { error } from 'console';
import { VolToTargetUni } from './CalcVolToTargetUni';
import { VolToTargetAlg } from './CalcVolToTargetAlg';

export async function calcVolToTarget(trade: Bool3Trade): Promise<Bool3Trade> {



	// Using only available liquidity in the current tick range
	// //  how much of X or Y tokens we need to * buy * to get to the target price ?
	let deltaTokens = 0
	let x = 0
	let delta: bigint = 0n
	let nextTickRange: any
	let currentTickRange: any

	// If the target price is not in the current tick range, use all the liquidity in the range
	if (this.sPriceTarget < sPriceLower || this.sPriceTarget > sPriceUpper) {
		return BigInt(liquidity)
	}

	// If the target price is in the current tick range, calculate the required liquidity
	deltaTokens = 0
	if (this.sPriceTarget > sPriceCurrent) {
		x = this.x_in_range(liquidity, sPriceCurrent, this.sPriceTarget)
	} else {
		x = this.y_in_range(liquidity, sPriceCurrent, this.sPriceTarget)
	}

	return BigInt(x)

	// if (uniswapV3Exchange[trade.target.exchange].protocol === 'UNIV3') {
	// 	const v = new VolToTargetUni(
	// 		trade.target.exchange,
	// 		trade.tokenIn,
	// 		trade.tokenOut,
	// 		trade.target.pool,
	// 		trade.target.inRangeLiquidity,
	// 		trade.target.priceTarget
	// 	)
	// 	trade.target.tradeSize = await v.calcVolToTarget()
	// 	if (trade.target.tradeSize === 0n) {
	// 		console.log("Trade size 0: ", trade.ticker, trade.loanPool.exchange, trade.target.exchange)
	// 		return trade
	// 	}
	// }
	// if (uniswapV3Exchange[trade.target.exchange].protocol === 'ALG') {
	// 	const v = new VolToTargetAlg(
	// 		trade.target.exchange,
	// 		trade.tokenIn,
	// 		trade.tokenOut,
	// 		trade.target.pool,
	// 		trade.target.inRangeLiquidity,
	// 		trade.target.priceTarget
	// 	)
	// 	trade.target.tradeSize = await v.calcVolToTarget()
	// 	if (trade.target.tradeSize === 0n) {
	// 		console.log("Trade size 0: ", trade.ticker, trade.loanPool.exchange, trade.target.exchange)
	// 		return trade
	// 	}
	// }
	// return trade


}