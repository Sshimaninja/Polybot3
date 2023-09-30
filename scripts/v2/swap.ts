require('dotenv').config()
require('colors')
import { BigNumber as BN } from "bignumber.js";
import { Prices } from './modules/prices';
import { FactoryPair, Pair } from '../../constants/interfaces';
import { AmountCalculator } from './modules/amountCalcSingle'
import { Trade } from './modules/getTrade';
import { gasVprofit } from './modules/gasVprofit';
import { Reserves } from './modules/reserves';
import { sendit } from './execute';
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
const tradePending = false;
const slippageTolerance = BN(0.006) // 0.65%
// var virtualReserveFactor = 1.1
var pendingID: string | undefined

export async function control(data: FactoryPair[], gasData: any) {
	const promises: any[] = [];

	for (const pair of data) {
		console.log("ExchangeA: " + pair.exchangeA + " ExchangeB: " + pair.exchangeB + " matches: " + pair.matches.length, " gasData: " + gasData.fast.maxFee + " " + gasData.fast.maxPriorityFee);

		for (const match of pair.matches) {
			if (!tradePending && match.poolA_id !== pendingID && match.poolB_id !== pendingID) {

				const r = new Reserves(match);
				const reserves = await r.getReserves(match);

				const p0 = new Prices(match.token0, match.token1, match.poolA_id, reserves[0]);
				const p1 = new Prices(match.token0, match.token1, match.poolB_id, reserves[1]);

				const c0 = new AmountCalculator(p0, match, slippageTolerance);
				const c1 = new AmountCalculator(p1, match, slippageTolerance);

				const amounts0 = await c0.getAmounts();
				const amounts1 = await c1.getAmounts();

				const amounts = await Promise.all([amounts0, amounts1]);

				const t = new Trade(pair, match, p0, p1, amounts[0], amounts[1], gasData);
				const trade = await t.getTrade();

				const dataPromise = tradeLogs(trade);
				const rollPromise = rollDamage(trade, await dataPromise, warning, tradePending, pendingID);

				promises.push(dataPromise, rollPromise);
			}
		}
	}

	await Promise.all(promises).catch((error: any) => {
		console.log("Error in control.ts: " + error.message);
		return;
	});
}