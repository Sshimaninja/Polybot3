require('dotenv').config()
require('colors')
import { utils } from 'ethers';
import { BigNumber as BN } from "bignumber.js";
import { Prices } from './modules/prices';
import { BoolFlash, HiLo, Difference, Pair, FactoryPair, BoolTrade } from '../constants/interfaces';
import { AmountCalculator } from './modules/amountCalcSingle'
import { getTrade } from './modules/populateTradeCtrl';
import { gasVprofit } from './modules/gasVprofit';
import { Reserves } from './modules/reserves';
import { sendit } from './execute';
import { logger } from '../constants/contract';
/*
TODO:
Replace 0/1 new class instances with a loop that handles n instances
*/
/**
 * @param data
 * @param gasData
 * @description
 * This function controls the execution of the flash swaps.
 * It loops through all pairs, and all matches, and executes the flash swaps.
 * It prevents multiple flash swaps from being executed at the same time, on the same pool, if the profit is too low, or the gas cost too high.
 */
let warning = 0
let tradePending = false;
let slippageTolerance = BN(0.0006) // 0.065%
// var virtualReserveFactor = 1.1
var pendingID: string | undefined

export async function control(data: FactoryPair[] | undefined, gasData: any) {

    data?.forEach(async (pairList: any) => {

        for (let p = 0; p < pairList.length; p++) {

            let pair: FactoryPair = pairList[p]

            // for (let m = 0; m < pair.matches.length; m++) 

            pair.matches.forEach(async (match: any, m: number) => {

                // let match = pair.matches[m]

                if (!tradePending && pair.matches[m].poolA_id !== pendingID && pair.matches[m].poolB_id !== pendingID) {

                    // 0. Get reserves for all pools:

                    let r = new Reserves(match)
                    let reserves = await r.getReserves(match)


                    // 1. Get prices: (Note, for initial testing, we will specify dual pools. Later, we will loop through all pools)

                    let p0 = new Prices(match.token0, match.token1, match.poolA_id, reserves[0])
                    let p1 = new Prices(match.token0, match.token1, match.poolB_id, reserves[1])
                    // 2. Calculate AmountsOut

                    let c0 = new AmountCalculator(p0, match, slippageTolerance)
                    let c1 = new AmountCalculator(p1, match, slippageTolerance)
                    //This uses price from opposing pool as 'target'price. Oracles can be used, but this is a simple solution, and not subject to manipulation.
                    let amounts0 = await c0.getAmounts(p0.reserves.reserveInBN, p0.reserves.reserveOutBN, p1.priceOutBN, slippageTolerance)
                    let amounts1 = await c1.getAmounts(p1.reserves.reserveInBN, p1.reserves.reserveOutBN, p0.priceOutBN, slippageTolerance)

                    // 3. Determine trade direction & profitability
                    let trade = await getTrade(pair, match, p0, p1, amounts0, amounts1, gasData)

                    // 4. Calculate Gas vs Profitability

                    if (trade.profit.gt(0)) {

                        let profit = await gasVprofit(trade)

                        let basicData = {
                            ticker: trade.ticker,
                            tradeSize: trade.recipient.tradeSize,
                            direction: trade.direction,
                            profit: profit.profit,
                            gasCost: profit.gasCost,
                        }

                        if (BN(profit.profit).gt(0)) {

                            // 5. If profitable, execute trade

                            if (BN(profit.profit).gt(0) && warning == 0) {
                                logger.info("Profitable trade found on " + trade.ticker + "!")
                                // logger.info(trade)
                                logger.info("Profit: ", profit.profit.toString(), "Gas Cost: ", profit.gasCost.toString(), "Flash Type: ", trade.flash.address)
                                tradePending = true
                                pendingID = trade.recipient.pool.address
                                await sendit(trade, profit.gasCost)
                                warning = 1
                                return warning
                            }
                            if (BN(profit.profit).gt(0) && warning == 1) {
                                logger.info("Trade pending on " + pendingID + "?: ", tradePending)
                                warning++
                                return warning
                            }
                            if (BN(profit.profit).gt(0) && warning > 1) {
                                return
                            }
                            if (BN(profit.profit).lt(0)) {
                                console.log("No trade")
                                return
                            }
                            if (profit.profit == undefined) {
                                console.log("Profit is undefined: error in gasVProfit")
                                return
                            }
                        }
                    } else {
                        // console.log(basicData)
                        return
                    }
                } else {
                    // console.log("Trade pending on " + pendingID + "?: ", tradePending)
                    return
                }
            })
        }
    })


}

