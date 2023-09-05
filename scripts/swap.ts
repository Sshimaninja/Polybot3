require('dotenv').config()
require('colors')
import { utils } from 'ethers';
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
Replace 0/1 new class instances with a loop that handles n instances
*/
let warning = 0
let tradePending = false;
let slippageTolerance = BN(0.01)
// var virtualReserveFactor = 1.1
var pendingID: string | undefined

export async function control(data: FactoryPair[] | undefined, gasData: any) {

    data?.forEach(async (pairList: any) => {

        for (let p = 0; p < pairList.length; p++) {

            let pair: FactoryPair = pairList[p]

            for (let m = 0; m < pair.matches.length; m++) {

                let match = pair.matches[m]

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
                    let amounts0 = await c0.getAmounts()
                    let amounts1 = await c1.getAmounts()


                    // 3. Determine trade direction & profitability
                    let t = new Trade(pair, match, p0, p1, amounts0, amounts1, gasData)
                    let trade = await t.getTradefromAmounts()

                    console.log({
                        ticker: trade.ticker,
                        amounts0: {
                            tradeSize: utils.formatUnits(amounts0.tradeSize, match.token0.decimals),
                            amountOutBN: amounts0.amountOutBN.toFixed(match.token1.decimals),
                            amountOutJS: utils.formatUnits(amounts0.amountOutJS, match.token1.decimals),
                            amountRepayBN: amounts0.amountRepayBN.toFixed(match.token1.decimals),
                            amountRepayJS: utils.formatUnits(amounts0.amountRepayJS, match.token1.decimals),
                            Profit: {
                                BN: BN(trade.profitBN).toFixed(match.token1.decimals),
                                JS: utils.formatUnits(trade.profitJS, match.token1.decimals),
                            },
                        },
                        amounts1: {
                            amountOutBN: amounts0.amountOutBN.toFixed(match.token1.decimals),
                            amountOutJS: utils.formatUnits(amounts0.amountOutJS, match.token1.decimals),
                            amountRepayBN: amounts0.amountRepayBN.toFixed(match.token1.decimals),
                            amountRepayJS: utils.formatUnits(amounts0.amountRepayJS, match.token1.decimals),
                            Profit: {
                                BN: BN(trade.profitBN).toFixed(match.token1.decimals),
                                JS: utils.formatUnits(trade.profitJS, match.token1.decimals),
                            },
                        },
                        calculations: {
                            calculation: utils.formatUnits(trade.tradeSize, match.token0.decimals) + " * " + p1.priceOutBN + " *  " + slippageTolerance + " = " + utils.formatUnits(amounts1.amountOutJS, match.token1.decimals) + " - " + utils.formatUnits(amounts0.amountRepayJS, match.token1.decimals) + " = " + utils.formatUnits(trade.profitJS, match.token1.decimals),
                            output: utils.formatUnits(trade.recipient.amountOutjs, match.token0.decimals),
                            repay: utils.formatUnits(trade.loanPool.amountRepayjs, match.token0.decimals),
                            profit: utils.formatUnits(trade.profitJS, match.token1.decimals),
                        }
                    })
                    // 4. Calculate Gas vs Profitability
                    let profit = await gasVprofit(trade).catch((error: any) => {
                        logger.error("(Swap) Error in gasVprofit: ", error)
                    })
                    if (profit?.profit !== undefined) {
                        let basicData = {
                            ticker: trade.ticker,
                            tradeSize: trade.tradeSize,
                            direction: trade.direction,
                            profit: profit.profit,
                            gasCost: profit.gasCost,
                        }

                        // 5. If profitable, execute trade

                        if (BN(profit.profit).gt(0)) {
                            logger.info("Profitable trade found on " + trade.ticker + "!")
                            // logger.info(trade)
                            logger.info("Profit: ", profit.profit.toString(), "Gas Cost: ", profit.gasCost.toString())
                            tradePending = true
                            pendingID = trade.recipient.pool.address
                            await sendit(trade, tradePending)
                            warning = 1
                        } else if (BN(profit.profit).lt(0)) {
                            console.log("No trade: \n", basicData)
                        } else if (warning == 0) {
                            logger.info("Trade pending on " + pendingID + "?: ", tradePending)
                            warning = 1
                            return warning
                        }
                    } else {
                        console.log("Profit is undefined: error in gasVProfit")
                    }
                }
            }
        }
    })
}

