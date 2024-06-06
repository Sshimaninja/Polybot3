import { GasData, Match3Pools, PoolState, PoolStateV3 } from '../../constants/interfaces'
import { flashV3Multi } from '../../constants/environment'
import { Contract } from 'ethers'
import { Bool3Trade } from '../../constants/interfaces'
import { populateTrade } from './populateTrade'
import { numberToBigInt, pu } from '../modules/convertBN'
import { IRL, InRangeLiquidity } from './classes/InRangeLiquidity'
import { uniswapV3Exchange } from '../../constants/addresses'
//import { IRL } from './modules/price/getIRL'


/**
 * @description
 * Class to determine trade parameters
 * returns a Bool3Trade object, which fills out all params needed for a trade.
 *
 */
export class Trade {
	trade: Bool3Trade | undefined
	match: Match3Pools
	pool0: Contract
	pool1: Contract
	irl0: InRangeLiquidity
	irl1: InRangeLiquidity
	state0: IRL
	state1: IRL
	gasData: GasData

	constructor(
		match: Match3Pools,
		pool0: Contract,
		pool1: Contract,
		irl0: InRangeLiquidity,
		irl1: InRangeLiquidity,
		state0: IRL,
		state1: IRL,
		gasData: GasData
	) {
		this.match = match
		this.pool0 = pool0
		this.pool1 = pool1
		this.irl0 = irl0
		this.irl1 = irl1
		this.state0 = state0
		this.state1 = state1
		this.gasData = gasData
	}


	async direction(): Promise<{ dir: string, targetPrice: number }> {

		/*
		  sample from polybot2:
		  async direction() {
			const A = this.priceA.priceOutBN;
			const B = this.priceB.priceOutBN;
			const diff = A.lt(B) ? B.minus(A) : A.minus(B);
			const dperc = diff.div(A.gt(B) ? A : B).multipliedBy(100); // 0.6% price difference required for trade (0.3%) + loa`n repayment (0.3%) on Uniswap V2
			const dir = A.gt(B) ? "A" : "B";
			return { dir, diff, dperc };
			}
		*/

		/**
		 * I want to have liquidity determine the direction of trade, but having Zt1 makes it easier to use WMATIC in available liquidity trade from wallet, 
		 * which are usually more profitable than hoping for a flash loan opportunity.
		 */
		// const A = this.state0.liq
		// const B = this.state1.liq

		const A = this.state0.price1
		const B = this.state1.price1
		const highPrice = A > B ? A : B //borrowing from the lowPrice pool and selling into the high price pool lowers the price of the highprice/targetpool by increasing liquidity.
		const lowPrice = A > B ? B : A
		const dir = highPrice === A ? 'A' : 'B'
		const d = A ? this.match.token0.decimals : this.match.token1.decimals

		return ({ dir: dir, targetPrice: lowPrice })
	}

	async getTrade() {
		const dir = await this.direction()
		const A = dir.dir == 'A' ? true : false

		const p0bigint = numberToBigInt(this.state0.price0, this.match.token0.decimals)
		const p1bigint = numberToBigInt(this.state1.price1, this.match.token1.decimals)

		const trade: Bool3Trade = {
			ID: A ? this.match.pool0.id : this.match.pool1.id,
			direction: dir.dir,
			type: 'error',
			safe: false,
			params: "no trade",
			ticker: this.match.token0.symbol + '/' + this.match.token1.symbol,
			tokenIn: this.match.token0,
			tokenOut: this.match.token1,
			contract: flashV3Multi, // This has to be set initially, but must be changed later per type.
			loanPool: {
				exchange: A
					? this.match.pool1.exchange
					: this.match.pool0.exchange,
				protocol: A
					? this.match.pool1.protocol
					: this.match.pool0.protocol,
				factory: A
					? uniswapV3Exchange[this.match.pool1.exchange].factory
					: uniswapV3Exchange[this.match.pool0.exchange].factory,
				quoter: A
					? uniswapV3Exchange[this.match.pool1.exchange].quoter
					: uniswapV3Exchange[this.match.pool0.exchange].quoter,
				router: A
					? uniswapV3Exchange[this.match.pool1.exchange].router
					: uniswapV3Exchange[this.match.pool0.exchange].router,
				pool: A ? this.pool1 : this.pool0,
				priceIn: A ? p1bigint : p0bigint,
				priceOut: A ? p0bigint : p1bigint,
				feeTier: A ? this.match.pool1.fee : this.match.pool0.fee,
				state: A ? this.state1 : this.state0,
				inRangeLiquidity: A ? this.irl1 : this.irl0,
				amountRepay: 0n,
			},
			target: {
				exchange: A
					? this.match.pool0.exchange
					: this.match.pool1.exchange,
				protocol: A
					? this.match.pool0.protocol
					: this.match.pool1.protocol,
				factory: A
					? uniswapV3Exchange[this.match.pool0.exchange].factory
					: uniswapV3Exchange[this.match.pool1.exchange].factory,
				quoter: A
					? uniswapV3Exchange[this.match.pool0.exchange].quoter
					: uniswapV3Exchange[this.match.pool1.exchange].quoter,
				router: A
					? uniswapV3Exchange[this.match.pool0.exchange].router
					: uniswapV3Exchange[this.match.pool1.exchange].router,
				pool: A ? this.pool0 : this.pool1,
				priceIn: A ? p0bigint : p1bigint,
				priceOut: A ? p1bigint : p0bigint,
				priceTarget: dir.targetPrice,
				feeTier: A ? this.match.pool0.fee : this.match.pool1.fee,
				state: A ? this.state0 : this.state1,
				tradeSize: 0n,
				amountOut: 0n,
				inRangeLiquidity: A ? this.irl0 : this.irl1,
			},
			// k: {
			// 	uniswapKPre: 0n,
			// 	uniswapKPost: 0n,
			// 	uniswapKPositive: false,
			// },
			gas: this.gasData,
			differenceTokenOut: 0,
			differencePercent: 0,
			profits: {
				tokenProfit: 0n,
				WMATICProfit: 0n,
			},

		}

		await populateTrade(trade);

		return trade
	}
}
