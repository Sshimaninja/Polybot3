import { BigNumber as BN } from 'bignumber.js'
import { GasData, Match3Pools, PoolState, PoolStateV3 } from '../../constants/interfaces'
import { flashMulti } from '../../constants/environment'
import { Contract } from 'ethers'

import { Bool3Trade } from '../../constants/interfaces'

import { AmountConverter } from './modules/amountConverter'
import { V3Quote } from './modules/price/v3Quote'
import {
	BigInt2BN,
	BigInt2String,
	BN2BigInt,
	fu,
	pu,
} from '../modules/convertBN'
import { filterTrade } from './modules/filterTrade'
import { PopulateRepays } from './modules/populateRepays'
// import { getK } from './modules/getK'

import { populateTrade } from './populateTrade'
import { slip } from '../../constants/environment'
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
	state0: PoolStateV3
	state1: PoolStateV3
	gasData: GasData

	constructor(
		match: Match3Pools,
		pool0: Contract,
		pool1: Contract,
		state0: PoolStateV3,
		state1: PoolStateV3,
		gasData: GasData
	) {
		this.match = match
		this.pool0 = pool0
		this.pool1 = pool1
		this.state0 = state0
		this.state1 = state1
		this.gasData = gasData
	}

	async direction() {
		const A = this.state0.price0
		const B = this.state1.price1
		const diff = A < (B) ? B - A : A - B
		const dperc = diff / (A > B ? A : B) * 100 // 0.6% price difference required for trade (0.3%) + loan repayment (0.3%) on Uniswap V2
		const dir = A > B ? 'A' : 'B'

		return { dir, diff, dperc }
	}

	async getSize(): Promise<bigint> {
		// const toPrice = await target.tradeToPrice()
		// use maxIn, maxOut to make sure the trade doesn't revert due to too much slippage on target
		// const q = new V3Quote(pool, exchange, fee)



		// const maxIn = //TODO: write TradeToPrice function.


		// const safeReserves = (loan.state.reservesIn * 800n) / 1000n //Don't use more than 80% of the reserves
		// const size = 1n // for testing this will do.
		// const safeReserves = loan.state.reservesIn
		// console.log("safeReserves: ", safeReserves)
		// const size = toPrice > safeReserves ? safeReserves : toPrice
		// const size = pu("10", this.match.token0.decimals)
		// const size = toPrice
		// console.log(">>>>>>>>>>>>>>>>>getSize")
		// console.log("SIZE: ", toPrice > (safeReserves) ? "safeReserves" : "toPrice")
		// console.log(fu(size, this.match.token0.decimals) + " " + this.match.token0.symbol)
		return 100n //size
	}

	async getTrade() {
		const dir = await this.direction()
		const A = dir.dir == 'A' ? true : false

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
				priceIn: A ? this.state1.price1 : this.state0.price0,
				priceOut: A ? this.state0.price0 : this.state1.price1,
				feeTier: A ? this.match.pool1.fee : this.match.pool0.fee,
				state: A ? this.state1 : this.state0,
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
				priceIn: A ? this.state0.price0 : this.state1.price1,
				priceOut: A ? this.state1.price1 : this.state0.price0,
				feeTier: A ? this.match.pool0.fee : this.match.pool1.fee,
				state: A ? this.state0 : this.state1,
				tradeSize: A
					? await this.getSize()
					: await this.getSize(),
				amountOut: 0n,
			},
			// k: {
			// 	uniswapKPre: 0n,
			// 	uniswapKPost: 0n,
			// 	uniswapKPositive: false,
			// },
			gasData: this.gasData,
			differenceTokenOut: dir.diff,
			differencePercent: dir.dperc,
			profit: 0n,
			profitPercent: 0n,
		}

		await populateTrade(trade);

		return trade
	}
}
