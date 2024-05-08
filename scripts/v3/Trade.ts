import { GasData, Match3Pools, PoolState, PoolStateV3 } from '../../constants/interfaces'
import { flashMulti } from '../../constants/environment'
import { Contract } from 'ethers'
import { Bool3Trade } from '../../constants/interfaces'
import { populateTrade } from './populateTrade'
import { getSize } from './getSize'
import { pu } from '../modules/convertBN'
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
		/**
		 * I want to have liquidity determine the direction of trade, but having Zt1 makes it easier to use WMATIC in available liquidity trade from wallet, 
		 * which are usually more profitable than hoping for a flash loan opportunity.
		 */
		// const A = this.state0.liq
		// const B = this.state1.liq
		const A = this.state0.price1
		const B = this.state1.price1
		const dir = A > B ? 'A' : 'B'
		return dir
		// const A = this.state0.price0
		// const B = this.state1.price1
		// const diff = A < (B) ? B - A : A - B
		// const dperc = diff / (A > B ? A : B) * 100 // 0.6% price difference required for trade (0.3%) + loan repayment (0.3%) on Uniswap V2
		// const dir = A > B ? 'A' : 'B'

		// return { dir, diff, dperc }
	}

	async getTrade() {
		const dir = await this.direction()
		const A = dir == 'A' ? true : false

		const trade: Bool3Trade = {
			ID: A ? this.match.pool0.id : this.match.pool1.id,
			direction: dir,
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
			differenceTokenOut: 0,
			differencePercent: 0,
			profit: 0n,
			profitPercent: 0n,
		}

		await populateTrade(trade);

		return trade
	}
}
