require('dotenv').config()
require('colors')
import { BigNumber as BN } from "bignumber.js";
import { FactoryPair, Pair } from '../../constants/interfaces';
import { Trade } from './modules/getV3Trade';
import { InRangeLiquidity, Match3Pools, V3Matches } from './modules/reserves';
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
const warning = 0
const tradePending = false;
const slippageTolerance = BN(0.0006) // 0.065%
// var virtualReserveFactor = 1.1
var pendingID: string | undefined


export async function control(data: V3Matches, gasData: any) {
	const promises: any[] = [];
	const matches: V3Matches = data;
	const pools: Match3Pools[] = data.matches;
	console.log("matches: " + matches.matches.length);


	for (const pool of pools) {
		console.log("ExchangeA: " + matches.exchangeA + " ExchangeB: " + matches.exchangeB + " matches: " + matches.matches.length, " gasData: " + gasData.fast.maxFee + " " + gasData.fast.maxPriorityFee);

		for (const match of matches.matches) {
			console.log("Getting Reserves and Data for Match: " + match.ticker + " " + match.poolID0.id + " " + match.poolID1.id)
			if (!tradePending && match.poolID0.id !== pendingID && match.poolID1.id !== pendingID) {


				const r = new InRangeLiquidity(match);
				const inRange = await r.getLiquidity();



				// const t = new Trade(pair, match, gasData);
				// const trade = await t.getTrade();

				// const dataPromise = tradeLogs(trade);
				// const rollPromise = rollDamage(trade, await dataPromise, warning, tradePending, pendingID);

				// promises.push(dataPromise, rollPromise);
			}
		}
	}

	// await Promise.all(promises).catch((error: any) => {
	// 	console.log("Error in control.ts: " + error.message);
	// 	return;
	// });
}