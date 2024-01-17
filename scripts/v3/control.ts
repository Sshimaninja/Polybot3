require('dotenv').config()
require('colors')
import { BigNumber as BN } from "bignumber.js";
import { abi as IUni3Pool } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { abi as IAlgPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json';
import { abi as IERC20 } from '@uniswap/v2-periphery/build/IERC20.json';
import { FactoryPair, Pair, Match3Pools, V3Matches } from '../../constants/interfaces';
import { Trade } from './getTrade';
import { tradeLogs } from './modules/tradeLog';
import { InRangeLiquidity } from './modules/inRangeLiquidity';
import { TickProvider } from "./modules/TickProvider";
import { Contract } from "ethers";
import { provider } from "../../constants/contract";
import { chainID } from "../../constants/addresses";
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
export const tradePending = false;
export const slippageTolerance = BN(0.006) // 0.65%
// var virtualReserveFactor = 1.1
var pendingID: string | undefined

export async function control(data: V3Matches, gasData: any) {
	const promises: any[] = [];
	const matches: Match3Pools[] = data.matches;
	console.log("matches: " + data.matches.length);

	// Because Uniswap voted to keep v3 proprietary for 2 years, algebra became the first open source AMM to implement v3, meaning most AMM dex's used it rather than Uniswap's v3.

	// console.log("ExchangeA: " + data.exchangeA + " ExchangeB: " + data.exchangeB + " matches: " + data.matches.length, " gasData: " + gasData.fast.maxFee + " " + gasData.fast.maxPriorityFee);

	// for (const match of matches) {
	matches.forEach(async (match: Match3Pools) => {

		if (!tradePending && match.pool0.id !== pendingID && match.pool1.id !== pendingID) {

			const pool0ABI = match.pool0.protocol === 'UNIV3' ? IUni3Pool : "ALG" ? IAlgPool : "ERROR"
			const pool1ABI = match.pool1.protocol === 'UNIV3' ? IUni3Pool : "ALG" ? IAlgPool : "ERROR"


			// console.log("pool0ABI: " + match.pool0.protocol + " pool1ABI: " + match.pool1.protocol)

			const pool0 = new Contract(match.pool0.id, pool0ABI, provider);
			const pool1 = new Contract(match.pool1.id, pool1ABI, provider);

			// console.log("pool0: " + pool0.getAddress() + " pool1: " + pool1.getAddress())
			const liq0 = await pool0.liquidity();
			const liq1 = await pool1.liquidity();
			if (liq0.isZero() || liq1.isZero()) {
				// console.log("Liquidity is zero for ", match.ticker, " on ", match.pool0.exchange, match.pool1.exchange, ". Skipping...")
				return;
			}


			const l0 = new InRangeLiquidity(match.pool0, pool0, match.token0, match.token1);
			const l1 = new InRangeLiquidity(match.pool1, pool1, match.token0, match.token1);
			const irl0 = await l0.getPoolState();
			const irl1 = await l1.getPoolState();

			return

			const t = new Trade(match, pool0, pool1, irl0, irl1, slippageTolerance, gasData);
			const trade = await t.getTrade();
			// console.log("Trade: ", trade.ticker, " ", trade.loanPool.exchange, trade.target.exchange, " " + trade.target.amountOut.toString() + " " + trade.tokenOut.symbol, " " + trade.loanPool.amountRepay.toString() + " " + trade.tokenOut.symbol, " " + trade.profit.toString() + " " + trade.tokenOut.symbol, " " + trade.profitPercent.toString() + "%")

			const dataPromise = await tradeLogs(trade);
			console.log(dataPromise)//TESTING
			// const rollPromise = rollDamage(trade, await dataPromise, warning, tradePending, pendingID);

			promises.push(dataPromise)//, rollPromise);
		}
	});
	await Promise.all(promises).catch((error: any) => {
		console.log("Error in control.ts: " + error.message);
		return;
	});
};