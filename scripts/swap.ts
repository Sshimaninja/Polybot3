require('dotenv').config()
require('colors')
import { BigNumber as BN } from "bignumber.js";
import { Prices } from './modules/prices';
import { FactoryPair, Pair } from '../constants/interfaces';
import { AmountCalculator } from './modules/amountCalcSingle'
import { Trade } from './modules/populateTrade';
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
const slippageTolerance = BN(0.0006) // 0.065%
// var virtualReserveFactor = 1.1
var pendingID: string | undefined

export async function control(data: FactoryPair[], gasData: any) {

    const promises: any[] = [];

    data.forEach(async (pair: FactoryPair) => {

        console.log("ExchangeA: " + pair.exchangeA + " ExchangeB: " + pair.exchangeB + " matches: " + pair.matches.length, " gasData: " + gasData.fast.maxFee + " " + gasData.fast.maxPriorityFee)

        pair.matches.forEach(async (match: Pair) => {

            if (!tradePending && match.poolA_id !== pendingID && match.poolB_id !== pendingID) {

                // 0. Get reserves for all pools:

                const r = new Reserves(match)
                const reserves = await r.getReserves(match)

                // 1. Get prices: (Note, for initial testing, we will specify dual pools. Later, we will loop through all pools)

                const p0 = new Prices(match.token0, match.token1, match.poolA_id, reserves[0])
                const p1 = new Prices(match.token0, match.token1, match.poolB_id, reserves[1])
                // 2. Calculate AmountsOut

                const c0 = new AmountCalculator(p0, match, slippageTolerance)
                const c1 = new AmountCalculator(p1, match, slippageTolerance)

                //This uses price from opposing pool as 'target'price. Oracles can be used, but this is a simple solution, and not subject to manipulation.
                const amounts0 = await c0.getAmounts(p0.reserves.reserveInBN, p0.reserves.reserveOutBN, p1.priceOutBN, slippageTolerance)
                const amounts1 = await c1.getAmounts(p1.reserves.reserveInBN, p1.reserves.reserveOutBN, p0.priceOutBN, slippageTolerance)

                const amounts = await Promise.all([amounts0, amounts1]);

                // 3. Determine trade direction & profitability
                const t = new Trade(pair, match, p0, p1, amounts[0], amounts[1], gasData);
                const trade = await t.getTrade()

                // 4. Calculate Gas vs Profitability

                const data = tradeLogs(trade);
                const roll = rollDamage(trade, await data, warning, tradePending, pendingID)

                promises.push(data, roll)

            }
        })
    })
    await Promise.all(promises)
}
