require('dotenv').config()
require('colors')
import { BigNumber as BN } from 'bignumber.js'
import { abi as IUni3Pool } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { abi as IAlgPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json'
import { abi as IERC20 } from '@uniswap/v2-periphery/build/IERC20.json'
import {
	FactoryPair,
	Pair,
	Match3Pools,
	V3Matches,
	GasData,
	Bool3Trade,
} from '../../constants/interfaces'
import { Trade } from './Trade'
import { tradeLogs } from './modules/tradeLog'
import { TickProvider } from './classes/TickProvider'
import { Contract } from 'ethers'
import { provider } from '../../constants/provider'
import { chainID, uniswapV3Exchange } from '../../constants/addresses'
import { slip } from '../../constants/environment'
import { logger } from '../../constants/logger'
import { InRangeLiquidity } from './classes/InRangeLiquidity'
import { filterTrade } from './modules/filterTrade'
import { trueProfit } from './modules/trueProfit'
import { fetchGasPrice } from './modules/transaction/fetchGasPrice'
import { flash } from './modules/transaction/flash'
import { importantSafetyChecks } from './modules/importantSafetyChecks'
import { abi as IUniswapV3Factory } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'
import { abi as IAlgebraFactory } from '@cryptoalgebra/core/artifacts/contracts/AlgebraFactory.sol/AlgebraFactory.json'
import { fu, pu } from '../modules/convertBN'

/*
TODO:
*/
/**
 * @param data
 * @param gasData
 * @description
 * This function controls the execution of the flash swaps.
 * It loops through all pairs, and all matches, and executes the flash swaps.
 * It prevents multiple flash swaps from being executed at the same time, on the same pool, if the profit is too low, or the gas cost too high.
 */
export const tradePending = false
export const slippageTolerance = BN(0.006) // 0.65%
// var virtualReserveFactor = 1.1
var pendingID: string | undefined
export let pendingTransactions: { [poolAddress: string]: boolean } = {};

logger.info("Control.ts: pendingTransactions: ");
logger.info(pendingTransactions);

export async function control(data: V3Matches, gasData: GasData) {
	const promises: any[] = []
	const matches: Match3Pools[] = data.matches
	console.log('matches: ' + data.matches.length)
	// Because Uniswap voted to keep v3 proprietary for 2 years, algebra became the first open source AMM to implement v3, meaning most AMM dex's used it rather than Uniswap's v3.

	// console.log("ExchangeA: " + data.exchangeA + " ExchangeB: " + data.exchangeB + " matches: " + data.matches.length, " gasData: " + gasData.fast.maxFee + " " + gasData.fast.maxPriorityFee);

	// for (const match of matches) {
	matches.forEach(async (match: Match3Pools) => {
		if (
			!tradePending &&
			match.pool0.id !== pendingID &&
			match.pool1.id !== pendingID
		) {

			const pool0ABI =
				match.pool0.protocol === 'UNIV3'
					? IUni3Pool
					: 'ALG'
						? IAlgPool
						: 'ERROR'
			const pool1ABI =
				match.pool1.protocol === 'UNIV3'
					? IUni3Pool
					: 'ALG'
						? IAlgPool
						: 'ERROR'

			if (
				pendingTransactions[match.pool1.id + match.pool0.id] ==
				true ||
				pendingTransactions[match.pool0.id + match.pool1.id] == true
			) {
				console.log(
					"Pending transaction on ",
					match.ticker,
					data.exchangeA,
					data.exchangeB,
					" waiting...",
				);
				return;
			}


			// console.log('init pools...')
			const pool0 = new Contract(match.pool0.id, pool0ABI, provider)
			const pool1 = new Contract(match.pool1.id, pool1ABI, provider)

			//console.log('get liquidity...')
			// console.log("pool0: " + pool0.getAddress() + " pool1: " + pool1.getAddress())
			const liq0 = await pool0.liquidity()
			const liq1 = await pool1.liquidity()
			if (liq0 == 0n || liq1 == 0n) {
				// console.log("Liquidity is zero for ", match.ticker, " on ", match.pool0.exchange, match.pool1.exchange, ". Skipping...")
				return
			}

			//console.log('get IRL...')
			// const p0 = new Prices(match.pool0, match.ticker)
			// const p1 = new Prices(match.pool1, match.ticker)
			// const prices0 = await p0.prices()
			// const prices1 = await p1.prices()

			const l0 = new InRangeLiquidity(
				match.pool0,
				pool0,
				match.token0,
				match.token1
			)
			const r0 = await l0.getIRL()
			//console.log("r0: ", r0.price1)
			const l1 = new InRangeLiquidity(
				match.pool1,
				pool1,
				match.token0,
				match.token1
			)
			const r1 = await l1.getIRL()
			//console.log("r1: ", r1.price1)

			// return

			const t = new Trade(
				match,
				pool0,
				pool1,
				l0,
				l1,
				r0,
				r1,
				gasData
			)


			const trade = await t.getTrade()
			//console.log("Trade: ", trade.ticker, " ", trade.loanPool.exchange, trade.target.exchange, " " + trade.target.amountOut.toString() + " " + trade.tokenOut.symbol, " " + trade.loanPool.amountRepay.toString() + " " + trade.tokenOut.symbol, " " + trade.profits.tokenProfit.toString())
			// return

			// return;
			if (trade.profits.tokenProfit <= 0) {
				//console.log("No profit for trade: " + trade.ticker);
				return;
			}

			//let safe = false;


			if (!trade.safe) {
				console.log("unsafe trade: ", trade.type)
				return;
			}

			//console.log("awaiting trueProfit...")
			await trueProfit(trade);
			console.log("trade.profits.WMATICProfit: ", fu(trade.profits.WMATICProfit, 18));

			// return;

			if (trade.profits.WMATICProfit < trade.gas.gasPrice) {
				console.log(
					"No profit after trueProfit: ",
					trade.ticker,
					trade.loanPool.exchange + trade.target.exchange,
					trade.type,
				);
				return;
			}

			// logger.info(log.tinyData);

			// EDIT: now only calling getchGasPrice once per block index.ts.
			// this is potentially slowing down tx execution to the point of falure for INSUFICCIENT_OUTPUT_AMOUNT
			let gas = await fetchGasPrice(trade);
			// trade.gas = gas;
			if (gas.tested == false) {
				console.log("Gas price not tested. Skipping trade.");
				return trade;
			}
			// const gasString = {
			//     gasPrice: fu(gas.gasPrice, 18),
			//     maxPriorityFee: fu(gas.maxPriorityFee, 9),
			//     tested: gas.tested,
			// };

			// console.log("trade.gas.tested :>> ", gasString);

			const logs = await tradeLogs(trade);
			logger.info(logs);

			let tx = null;
			if (trade.type.includes("flash")) {
				let tx = await flash(trade);
			}

			//if (trade.type == "single") {
			//	let tx = await swap(trade);
			//}
			if (tx !== null) {
				promises.push(tx);
			}
			await Promise.all(promises);

		}
	})
}