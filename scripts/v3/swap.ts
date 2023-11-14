require('dotenv').config()
require('colors')
import { BigNumber as BN } from "bignumber.js";
import { abi as IUni3Pool } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { abi as IAlgPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json';
import { FactoryPair, Pair, Match3Pools, V3Matches } from '../../constants/interfaces';
import { Trade } from './getTrade';
import { tradeLogs } from './modules/tradeLog';
import { InRangeLiquidity } from './modules/inRangeLiquidity';
import { TickProvider } from "./modules/TickProvider";
import { Contract } from "ethers";
import { provider } from "../../constants/contract";
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
const tradePending = false;
const slippageTolerance = BN(0.0006) // 0.065%
// var virtualReserveFactor = 1.1
var pendingID: string | undefined



export async function control(data: V3Matches, gasData: any) {
	const promises: any[] = [];
	const matches: Match3Pools[] = data.matches;
	console.log("matches: " + data.matches.length);

	// Because Uniswap voted to keep v3 proprietary for 2 years, algebra became the first open source AMM to implement v3, meaning most AMM dex's used it rather than Uniswap's v3.
	const pool0ABI = data.exchangeA === 'UNI' ? IUni3Pool : IAlgPool
	const pool1ABI = data.exchangeB === 'UNI' ? IUni3Pool : IAlgPool

	console.log("ExchangeA: " + data.exchangeA + " ExchangeB: " + data.exchangeB + " matches: " + data.matches.length, " gasData: " + gasData.fast.maxFee + " " + gasData.fast.maxPriorityFee);

	// for (const match of matches) {
	matches.forEach(async (match: Match3Pools) => {

		if (!tradePending && match.pool0.id !== pendingID && match.pool1.id !== pendingID) {

			const pool0 = new Contract(match.pool0.id, pool0ABI, provider);
			const pool1 = new Contract(match.pool1.id, pool1ABI, provider);


			const l0 = new InRangeLiquidity(match.pool0, pool0);
			const l1 = new InRangeLiquidity(match.pool1, pool1);
			const irl0 = await l0.getPoolState();
			const irl1 = await l1.getPoolState();
			if (irl0.liquidity.isZero() || irl1.liquidity.isZero()) {
				return;
			}

			const t = new Trade(match, pool0, pool1, irl0, irl1, slippageTolerance, gasData);
			const trade = await t.getTrade();

			const dataPromise = tradeLogs(trade);
			console.log(dataPromise)//TESTING
			// const rollPromise = rollDamage(trade, await dataPromise, warning, tradePending, pendingID);

			promises.push(dataPromise)//, rollPromise);
		}
	});
	await Promise.all(promises).catch((error: any) => {
		console.log("Error in control.ts: " + error.message);
		return;
	});
}


// const data = {
// 	irl0: {
// 		priceOut: irl0.priceOutBN.toFixed(match.token1.decimals),
// 	},
// 	irl1: {
// 		priceOut: irl1.priceOutBN.toFixed(match.token1.decimals),
// 	},
// 	match: match,
// }
// console.log(data)