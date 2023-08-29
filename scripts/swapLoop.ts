require('dotenv').config()
require('colors')
import { BigNumber as BN } from "bignumber.js";
import { Prices } from './modules/prices';
import { BoolFlash, HiLo, Difference, Pair, FactoryPair, BoolTrade } from '../constants/interfaces';
import { AmountCalculator } from './amountCalcSingle'
import { Trade } from './modules/populateTrade';
import { gasVprofit } from './modules/gasVprofit';
import { Reserves } from './modules/reserves';
import { sendit } from './execute';
import { logger } from '../constants/contract';
/*
TODO:
Database is corrupted (returning WMATIC/ETH for most pairs) - fix this
Replace 0/1 new class instances with a loop that handles n instances
*/
let warning = 0
let tradePending = false;
let slippageTolerance = BN(0.01)
// var virtualReserveFactor = 1.1
var pendingID: string | undefined

export async function control(data: FactoryPair[] | undefined) {
    // console.log(data)
    data?.forEach(async (pairList: any) => {

        for (let p = 0; p < pairList.length; p++) {
            let pair: FactoryPair = pairList[p]
            for (let m = 0; m < pair.matches.length; m++) {

                let match = pair.matches[m]
                if (!tradePending && pair.matches[m].poolA_id !== pendingID && pair.matches[m].poolB_id !== pendingID) {
                    // 0. Get reserves:            

                    let r0 = new Reserves(match.poolA_id)
                    let reserves0 = await r0.getReserves()
                    let r1 = new Reserves(match.poolB_id)
                    let reserves1 = await r1.getReserves()

                    // 1. Get prices:

                    let p0 = new Prices(match.token0, match.token1, match.poolA_id, reserves0)
                    let p1 = new Prices(match.token0, match.token1, match.poolB_id, reserves1)

                    // 2. Calculate AmountsOut

                    let c0 = new AmountCalculator(p0, match, slippageTolerance)
                    let c1 = new AmountCalculator(p1, match, slippageTolerance)

                    // 3. Determine trade direction & profitability
                    let t = new Trade(pair, match, c0, c1)
                    let trade = await t.getTradefromAmounts()

                    let basicData = {
                        ticker: trade.ticker,
                        tradeSize: trade.tradeSize,
                        direction: trade.direction,
                        profit: trade.profitBN.toFixed(trade.tokenOut.decimals),
                    }

                    // 4. Calculate Gas vs Profitability
                    let profit = await gasVprofit(t)

                    // 5. If profitable, execute trade
                    if (profit.gt(0)) {
                        logger.info("Profitable trade found on " + trade.ticker + "!")
                        logger.info(trade)
                        tradePending = true
                        pendingID = trade.recipient.poolID
                        await sendit(t, tradePending)
                        logger.info("Trade pending on " + trade.ticker + "?: ", tradePending)
                        warning = 1
                    } else if (profit.eq(0)) {
                        console.log("No trade: \n", basicData)
                    }
                } else if (warning == 0) {
                    logger.info("Trade pending on " + pendingID + "?: ", tradePending)
                    warning = 1
                    return warning
                }
            }
        }
    })
}

