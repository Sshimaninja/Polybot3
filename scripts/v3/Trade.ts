import { BigNumber as BN } from 'bignumber.js'
import { GasData, Match3Pools, PoolState } from '../../constants/interfaces'
import { flashMulti } from '../../constants/environment'
import { Contract } from 'ethers'

import { Bool3Trade } from '../../constants/interfaces'

import { AmountConverter } from './modules/amountConverter'
import { V3Quote } from './modules/price/V3Quote2'
import {
	BigInt2BN,
	BigInt2String,
	BN2BigInt,
	fu,
	pu,
} from '../modules/convertBN'
import { filterTrade } from './modules/filterTrade'
import { PopulateRepays } from './modules/populateRepays'
import { getK } from './modules/getK'
import { populateTrade } from './populateTrade'

/**
 * @description
 * Class to determine trade parameters
 * returns a BoolTrade object, which fills out all params needed for a trade.
 *
 */
export class Trade {
	trade: Bool3Trade | undefined
	match: Match3Pools
	pool0: Contract
	pool1: Contract
	state0: PoolState
	state1: PoolState
	slip: BN
	gasData: GasData

	constructor(
		match: Match3Pools,
		pool0: Contract,
		pool1: Contract,
		state0: PoolState,
		state1: PoolState,
		slip: BN,
		gasData: GasData
	) {
		this.match = match
		this.pool0 = pool0
		this.pool1 = pool1
		this.state0 = state0
		this.state1 = state1
		this.slip = slip
		this.gasData = gasData
	}

	async direction() {
		const A = this.state0.priceOutBN
		const B = this.state1.priceOutBN
		const diff = A.lt(B) ? B.minus(A) : A.minus(B)
		const dperc = diff.div(A.gt(B) ? A : B).multipliedBy(100) // 0.6% price difference required for trade (0.3%) + loan repayment (0.3%) on Uniswap V2
		const dir = A > B ? 'A' : 'B'

		return { dir, diff, dperc }
	}

	async getSize(
		loan: AmountConverter,
		target: AmountConverter
	): Promise<bigint> {
		const toPrice = await target.tradeToPrice()
		// use maxIn, maxOut to make sure the trade doesn't revert due to too much slippage on target
		const safeReserves = (loan.state.reservesIn * 800n) / 1000n //Don't use more than 80% of the reserves
		// const safeReserves = loan.state.reservesIn
		// console.log("safeReserves: ", safeReserves)
		const size = toPrice > safeReserves ? safeReserves : toPrice
		// const size = pu("10", this.match.token0.decimals)
		// const size = toPrice
		// console.log(">>>>>>>>>>>>>>>>>getSize")
		// console.log("SIZE: ", toPrice > (safeReserves) ? "safeReserves" : "toPrice")
		// console.log(fu(size, this.match.token0.decimals) + " " + this.match.token0.symbol)
		return size
	}

	async getTrade() {
		const dir = await this.direction()
		const A = dir.dir == 'A' ? true : false

		const calcA = new AmountConverter(
			this.match,
			this.state0,
			this.state1.priceOutBN,
			this.match.pool0.fee,
			this.slip
		)
		const calcB = new AmountConverter(
			this.match,
			this.state1,
			this.state0.priceOutBN,
			this.match.pool1.fee,
			this.slip
		)

		const trade: Bool3Trade = {
			ID: A ? this.match.pool0.id : this.match.pool1.id,
			direction: dir.dir,
			type: 'error',
			ticker: this.match.token0.symbol + '/' + this.match.token1.symbol,
			tokenIn: this.match.token0,
			tokenOut: this.match.token1,
			flash: flashMulti, // This has to be set initially, but must be changed later per type.
			loanPool: {
				exchange: A
					? this.match.pool1.exchange
					: this.match.pool0.exchange,
				protocol: A
					? this.match.pool1.protocol
					: this.match.pool0.protocol,
				pool: A ? this.pool1 : this.pool0,
				feeTier: A ? this.match.pool1.fee : this.match.pool0.fee,
				state: A ? this.state1 : this.state0,
				calc: A ? calcB : calcA,
				repays: {
					getAmountsOut: 0n,
					getAmountsIn: 0n,
					repay: 0n,
				},
				amountRepay: 0n,
			},
			target: {
				exchange: A
					? this.match.pool0.exchange
					: this.match.pool1.exchange,
				protocol: A
					? this.match.pool0.protocol
					: this.match.pool1.protocol,
				pool: A ? this.pool0 : this.pool1,
				feeTier: A ? this.match.pool0.fee : this.match.pool1.fee,
				state: A ? this.state0 : this.state1,
				calc: A ? calcA : calcB,
				tradeSize: A
					? await this.getSize(calcB, calcA)
					: await this.getSize(calcA, calcB),
				amountOut: 0n,
			},
			k: {
				uniswapKPre: 0n,
				uniswapKPost: 0n,
				uniswapKPositive: false,
			},
			gasData: this.gasData,
			differenceTokenOut:
				dir.diff.toFixed(this.match.token1.decimals) +
				' ' +
				this.match.token1.symbol,
			differencePercent:
				dir.dperc.toFixed(this.match.token1.decimals) + '%',
			profit: 0n,
			profitPercent: 0n,
		}

		await populateTrade(trade);

		return trade
	}
}
