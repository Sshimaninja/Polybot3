require('dotenv').config()
require('colors')
import { BigNumber as BN } from "bignumber.js";
import { Prices } from './modules/prices';
import { BoolFlash, HiLo, Difference, Pair, FactoryPair, BoolTrade } from '../constants/interfaces';
import { AmountCalculator } from './amountCalcSingle'
import { Trade } from './modules/populateTrade';
import { gasVprofit } from './modules/gasVprofit';
import { Reserves } from './modules/reserves';

/*
 
- Initialize each pair as a SmartPair

- Get reserves for each pair

- Calculate AmountsOut for each SmartPair (includes lowSlippage tradeAmounts)

- Determine profitability for each SmartPair

- If profitable, populate trade

- Execute trade

TODO:
Replace 0/1 new class instances with a loop that handles n instances

*/

import * as log4js from "log4js";
import { sendit } from "./execute";

log4js.configure({
    appenders: {
        flashit: { type: "file", filename: "flashit.log", layout: { type: "pattern", pattern: "%d %p %m" } },
        out: { type: "stdout", layout: { type: "pattern", pattern: "%d %p %[%m%]" } }
    },
    categories: { default: { appenders: ["flashit", "out"], level: "info" } },
});

const logger = log4js.getLogger();

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
                let reserves0= await r0.getReserves()
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
                if (profit.gt(0) ) {
                    logger.info("Profitable trade found on " + trade.ticker + "!")
                    logger.info(trade)
                    tradePending = true
                    pendingID = trade.recipient.poolID
                    await sendit(t, tradePending)
                    logger.info("Trade pending on "+ trade.ticker + "?: ", tradePending)
                    warning = 1                
                } else if (profit.eq(0)) {
                    console.log("No trade: \n", basicData)
                }
            } else if (warning == 0) {
                logger.info("Trade pending on "+ pendingID + "?: ", tradePending)
                warning = 1
                return warning
            }            
        }
      }
  })
}



        // let loanCost = await calculateLoanCost(
        //     amountOutLoanPool,
        //     amountRepayLoanPool
        // )
        // // const loanCost = loanCostPercent.multipliedBy(100);

        // // var loanCost = amountRepayLoanPool.minus(amountOutLoanPool)
        // // var loanCostPercent = loanCost.dividedBy(amountOutLoanPool).multipliedBy(100)

        // var premium = hilo.higher.minus(hilo.lower)
        // var loanprem = premium.div(hilo.higher).multipliedBy(100)

        // var profit = amountOutRecipient.minus(amountRepayLoanPool)
        // var profitPercent = profit.dividedBy(amountOutRecipient).multipliedBy(100)
        // var profitjs = utils.parseUnits(profit.toFixed(sp.tokenOutdec), sp.tokenOutdec)


        // const amounts = {
        //     direction: trade.direction,
        //     loanPool: trade.loanPool.exchange,
        //     recipient: trade.recipient.exchange,
        //     amountIn: await calculator.getTradeAmount() + " " + sp.tokenInsymbol,
        //     amountOutLoanPool: amountOutLoanPool.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
        //     amountOutRecipient: amountOutRecipient.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
        //     amountRepayLoanPool: amountRepayLoanPool.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
        //     amountRepayRecipient: amountRepayRecipient.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
        //     loanPoolPriceOut: trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + sp.tokenOutsymbol + "/" + sp.tokenInsymbol,
        //     recipientPriceOut: trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + sp.tokenOutsymbol + "/" + sp.tokenInsymbol,
        //     differenceAmountsOut: differencePrice.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol + " (" + differencePercent.toFixed(sp.tokenOutdec) + "%)",
        //     differenceOutvsRepay: (differenceOut.toFixed(8) + " " + sp.tokenOutsymbol + " (" + ((differenceOut.dividedBy(amountOutRecipient)).multipliedBy(100)).toFixed(4) + "%)"),
        //     projectedProfit: profit.toFixed(sp.tokenOutdec),
        //     loanPoolReserves: trade.loanPool.reserveIn.toFixed(sp.tokenIndec) + " " + sp.tokenInsymbol + " " + trade.loanPool.reserveOut.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
        //     recipientReserves: trade.recipient.reserveIn.toFixed(sp.tokenIndec) + " " + sp.tokenInsymbol + " " + trade.recipient.reserveOut.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
        //     loanPremium: loanprem.toFixed(6) + "%",
        //     loanCost: loanCost.loanCost.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol + " (" + loanCost.loanCostPercentage.toFixed(6) + "%)",
        //     //The following must be equal after the flash loan is repaid.

        //     prevloanPoolK: trade.loanPool.reserveIn.multipliedBy(trade.loanPool.reserveOut).toFixed(20),
        //     postloanPoolK: (trade.loanPool.reserveIn.minus(calculator.amountInTrade)).multipliedBy(trade.loanPool.reserveOut.plus(amountRepayLoanPool)).toFixed(20),
        // }
        // console.log(amounts)
        // const blockNumber = await provider.getBlockNumber();
        // // logger.info(amounts)//DEBUG
        // // return

        // let tradejs: BoolFlash = {
        //     ticker: sp.ticker,
        //     tokenInsymbol: sp.tokenInsymbol,
        //     // tokenInPrice: utils.parseUnits(trade.tokenInPrice.toFixed(tokenIndec), tokenIndec),
        //     tokenInID: sp.tokenInID,
        //     tokenIndec: sp.tokenIndec,
        //     tokenOutsymbol: sp.tokenOutsymbol,
        //     tokenOutPrice: utils.parseUnits(trade.recipient.tokenOutPrice.toFixed(sp.tokenOutdec), sp.tokenOutdec),
        //     tokenOutID: sp.tokenOutID,
        //     tokenOutdec: sp.tokenOutdec,
        //     amountIn: calculator.amountIn,
        //     expectedProfit: profitjs,
        //     loanPool: {
        //         exchange: trade.loanPool.exchange,
        //         poolID: trade.loanPool.poolID,
        //         // tokenInPrice: utils.parseUnits(trade.loanPool.tokenInPrice.toFixed(tokenIndec), tokenIndec),
        //         tokenOutPrice: utils.parseUnits(trade.loanPool.tokenOutPrice.toFixed(sp.tokenOutdec), sp.tokenOutdec),
        //         reserveIn: trade.loanPool.reserveInjs,
        //         reserveOut: trade.loanPool.reserveOutjs,
        //         factoryID: trade.loanPool.factoryID,
        //         routerID: trade.loanPool.routerID,
        //         amountOut: amountOutLoanPooljs,
        //         amountRepay: amountRepayLoanPooljs,
        //     },
        //     recipient: {
        //         exchange: trade.loanPool.exchange,
        //         poolID: trade.loanPool.poolID,
        //         // tokenInPrice: utils.parseUnits(trade.recipient.tokenInPrice.toFixed(tokenIndec), tokenIndec),
        //         tokenOutPrice: utils.parseUnits(trade.recipient.tokenOutPrice.toFixed(sp.tokenOutdec), sp.tokenOutdec),
        //         reserveIn: trade.recipient.reserveInjs,
        //         reserveOut: trade.recipient.reserveOutjs,
        //         factoryID: trade.recipient.factoryID,
        //         routerID: trade.recipient.routerID,
        //         amountOut: amountOutRecipientjs,
        //     },
        // }
        // // console.log('attaining gas price & profit comparison...')

        // async function profitablejs() {
        //     const profitablejs = profitPercent.gt(0) ? await gasVprofit(tradejs) : BigNumber.from(0.0)
        //     const profitable = BN(utils.formatUnits(profitablejs, sp.tokenOutdec))
        //     return profitable
        // }
        // const profitable = await profitablejs()

        // if (profitable.gt((0.0)) && !tradePending) {
        //     tradePending = true
        //     logger.info("***Sending transaction to flashSwap contract " + sp.ticker + " on block " + blockNumber + "***")
        //     logger.info("==============STRATEGY: " + sp.tokenInsymbol + "/" + sp.tokenOutsymbol + "==============")
        //     logger.info("amountIn: " + calculator.amountInTrade + " " + sp.tokenInsymbol + " (" + trade.direction + ")")
        //     logger.info(sp.ticker)
        //     logger.info("Price Check:" + sp.ticker)
        //     logger.info(amounts)
        //     logger.info(trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + sp.tokenInsymbol + "/" + sp.tokenOutsymbol)
        //     logger.info(trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + sp.tokenInsymbol + "/" + sp.tokenOutsymbol)
        //     logger.info("Borrow: " + amounts.amountIn + " " + sp.tokenInsymbol + " from " + trade.loanPool.exchange)
        //     logger.info("Sell for: " + amountOutRecipient + " " + sp.tokenOutsymbol + " on " + trade.recipient.exchange)
        //     logger.info("Repay: " + amounts.amountRepayLoanPool + sp.tokenOutsymbol + " to " + trade.loanPool.exchange)
        //     logger.info("Loan Fee: " + premium.toFixed(sp.tokenOutdec)/*utils.formatUnits(premium, tokenOutdec)*/ + " " + sp.tokenOutsymbol)
        //     logger.info("Slippage Tolerance: " + (Number(sp.slippageTolerance) * 100) + "%")
        //     logger.info("Profit:" + profit)
        //     logger.info("ProfitPercent: " + profitPercent.toString() + " " + sp.tokenOutsymbol)
        //     // logger.info("Profit: " + profit.toFixed(tokenOutdec) + " " +tokenOutsymbol)
        //     logger.info("===============================================================")
        //     logger.info("Executing Trade on Block: " + blockNumber)
        //     logger.info("===============================================================")
        //     let gasMult = 1.1
        //     let nonce = await provider.getTransactionCount(wallet.address);
        //     try {
        //         // return//DEBUG
        //         await sendit(
        //             // profitjs,
        //             tradejs,
        //             // gasMult,
        //             tradePending,
        //             nonce);
        //         if (tradePending) {
        //             logger.info("Trade pending...")
        //             tradePending = false;
        //         } else {
        //             logger.info("Trade failed. Exiting...")
        //             tradePending = false;
        //         }
        //     } catch (error: any) {
        //         if (error.code === "INSUFFICIENT_FUNDS") {
        //             logger.info('Insufficient funds for gas * price + value')
        //             tradePending = false;
        //             return
        //         }
        //         if (error.code === 'TRANSACTION_UNDERPRICED') {
        //             gasMult = gasMult++;
        //             nonce++;
        //             logger.info('Transaction underpriced. Retrying with increased maxFeePerGas...')
        //             await sendit(
        //                 // profitjs, 
        //                 tradejs,
        //                 // gasMult, 
        //                 tradePending,
        //                 nonce)
        //         } if (error.code === `EXCEEDS_BLOCK_GAS_LIMIT`) {
        //             logger.error('Tx price exceeds block gas limit. Aborting...')
        //             tradePending = false;
        //         } if (!tradePending && error.code === 'NONCE_EXPIRED') {
        //             logger.info('Nonce too low. Retrying with increased gas...')
        //             // nonce++;
        //             gasMult++;
        //             await sendit(
        //                 // profitjs,
        //                 tradejs,
        //                 // gasMult,
        //                 tradePending,
        //                 nonce)
        //             tradePending = true
        //         } if (tradePending && error.code === 'NONCE_EXPIRED') {
        //             // nonce++
        //             gasMult++
        //             console.log('Nonce too low. Incrementing Gas Price.')
        //             tradePending = false
        //         } else {
        //             logger.error(':::::::::Unhandled Error sending transaction:::::::::')
        //             logger.error(error)
        //         }
        //     }
        // } else if (profitPercent.gt((0.0)) && tradePending) {
        //     if (warning == 0) {
        //         warning++
        //         logger.info(sp.ticker + " trade pending. Skipping to next asset...")
        //         return
        //     } else {
        //         return
        //     }
        // } else if (profitPercent.lt(BN(0.0))) {
        //     console.log("==============STRATEGY (UNPROFITABLE): " + sp.tokenInsymbol + "/" + sp.tokenOutsymbol + "==============")
        //     // console.log("amountIn: " + amountInTrade + " " + tokenInsymbol + " (" + trade.direction + ")")
        //     // console.log(ticker)
        //     // console.log("Price Check:" + ticker)
        //     // console.log(amounts)
        //     // console.log(trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + tokenInsymbol + "/" + tokenOutsymbol)
        //     // console.log(trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + tokenInsymbol + "/" + tokenOutsymbol)
        //     // console.log("Borrow: " + amounts.amountIn + " " + tokenInsymbol + " from " + trade.loanPool.exchange)
        //     // console.log("Sell for: " + amountOutRecipient + " " + tokenOutsymbol + " on " + trade.recipient.exchange)
        //     // console.log("Repay: " + amounts.amountRepayLoanPool + tokenOutsymbol + " to " + trade.loanPool.exchange)
        //     // console.log("Loan Fee: " + premium.toFixed(tokenOutdec)/*utils.formatUnits(premium, tokenOutdec)*/ + " " + tokenOutsymbol)
        //     // console.log("Slippage Tolerance: " + (Number(slippageTolerance) * 100) + "%")
        //     // console.log("Profit: " + profitable.toString(tokenOutdec) + " " + tokenOutsymbol)
        //     // console.log("Block: " + blockNumber + " No trade executed. Skipping to next asset...")
        //     // console.log("===============================================================")
        //     return
        // }
//     });
// }
// provider.on('block', async (blockNumber: any) => {
//     console.log('New block received:::::::::::::::::: Block # ' + blockNumber + ":::::::::::::::")
//     compare();
// });