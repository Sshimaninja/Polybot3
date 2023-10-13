require('dotenv').config()
require('colors')
import { BigNumber as BN } from "bignumber.js";
import { Prices } from './modules/prices';
import { FactoryPair, Pair } from '../../constants/interfaces';
import { AmountConverter } from './modules/amountConverter'
import { Trade } from './modules/getTrade';
import { gasVprofit } from './modules/gasVprofit';
import { Reserves } from './modules/reserves';
import { tradeLogs } from './modules/tradeLog';
import { rollDamage } from './modules/damage';
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
const slippageTolerance = BN(0.01)

export async function control(data: FactoryPair[], gasData: any) {
	const promises: any[] = [];

	for (const pair of data) {
		console.log("ExchangeA: " + pair.exchangeA + " ExchangeB: " + pair.exchangeB + " matches: " + pair.matches.length, " gasData: " + gasData.fast.maxFee + " " + gasData.fast.maxPriorityFee);

		for (const match of pair.matches) {

			const r = new Reserves(match);
			const reserves = await r.getReserves(match);

			const p0 = new Prices(match.token0, match.token1, match.poolA_id, reserves[0]);
			const p1 = new Prices(match.token0, match.token1, match.poolB_id, reserves[1]);

			const t = new Trade(pair, match, p0, p1, slippageTolerance, gasData);
			const trade = await t.getTrade();

			const dataPromise = tradeLogs(trade);
			const rollPromise = rollDamage(trade, await dataPromise, warning);

			promises.push(dataPromise, rollPromise);
		}
	}

	await Promise.all(promises).catch((error: any) => {
		console.log("Error in swap.ts: " + error.message);
		return ("Error in swap.ts: " + error.message);
	});
}