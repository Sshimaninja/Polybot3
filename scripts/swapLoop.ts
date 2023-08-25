//IMPORTS
// import { V2V2SORT } from '../utils/dexdata/V2V2/comparev2';
require('dotenv').config()//for importing parameters
require('colors')//for console output
import { uniswapRouter, uniswapV2Factory, uniswapV3Factory, gasToken, deployedMap } from '../constants/addresses';
import { provider, flash } from '../constants/contract';
import Web3 from 'web3';
import { BigNumber, ethers, utils } from 'ethers';
import { BigNumber as BN } from "bignumber.js";
import fs from 'fs';

import { SmartPair } from './modules/smartPair';
import { SmartPool } from './modules/smartPool';
import { Prices } from './modules/prices';

import { sendit } from './execute';
// import { V2Quote, V2Input } from '../utils/price/uniswap/v2/getPrice';
import { wallet } from '../constants/contract';
//ABIs
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
//trade interface
import { BoolFlash, Trade, HiLo, Difference, Pair } from '../constants/interfaces';

import { lowSlippage } from './modules/lowslipBN';
import { getAmountsIn, getAmountsOut, getAmountsIO } from './modules/getAmountsIO';
import { getAmountsIn as getAmountsInjs, getAmountsOut as getAmountsOutjs, getAmountsIO as getAmountsIOjs } from './modules/getAmountsIOjs';
import { AmountCalculator } from './amountCalculator'
import { TradeMsg } from './modules/tradeMsg';
import { getTradefromAmounts } from './modules/populateTrade';
// import { getTradefromAmounts } from './modules/populateTradeFromSmartPair';
import { fetchGasPrice } from "./modules/fetchGasPrice";
import { gasVprofit } from './modules/gasVprofit';
import { calculateLoanCost } from './modules/loanCost'
import { Reserves } from './modules/reserves';
import path from 'path';
// import { getReserves } from './modules/getReseverves';

/*

*/


import * as log4js from "log4js";
import { getDifference, getGreaterLesser, getHiLo } from './modules/getHiLo';

log4js.configure({
    appenders: {
        flashit: { type: "file", filename: "flashit.log", layout: { type: "pattern", pattern: "%d %p %m" } },
        out: { type: "stdout", layout: { type: "pattern", pattern: "%d %p %[%m%]" } }
    },
    categories: { default: { appenders: ["flashit", "out"], level: "info" } },
});

const logger = log4js.getLogger();
// logger.level = "info";
// logger.debug("Logging Debug");
logger.info("Logging Info");
logger.error("Logging Error");
logger.warn("Logging Warn");
logger.info("from swapLoops.ts")
// const interval = 4 * 2000
// const inverval = provider.on('block', async (blockNumber: any) => {})

if (process.env.PRIVATE_KEY === undefined) {
    throw new Error("Private key is not defined");
}
//TODO: CREATE convertToGas function to compare token1 profit to gas cost, to determine profitability of trade.

let warning = 0
let tradePending = false;
let slippageTolerance = BN(0.01)
var virtualReserveFactor = 1.1//potential adjustment for virtual reserves, which could be used to increase slippage tolerance.

export async function compare(data: Pair[] | undefined) {

    data?.forEach(async (pair: any) => {
        /*
        
        - Initialize each pair as a SmartPair

        - Get reserves for each pair

        - Calculate AmountsOut for each SmartPair (includes lowSlippage tradeAmounts)

        - Determine profitability for each SmartPair

        - If profitable, populate trade

        - Execute trade

        */

        // 0. Get reserves:

        let reserves0 = new Reserves(pair.poolA_id)
        let reserves1 = new Reserves(pair.pairB_id)

        // 1. Get prices:

        let prices0 = new Prices(pair, pair.pairA_id, reserves0)
        let prices1 = new Prices(pair, pair.pairB_id, reserves1)

        // 2. Calculate AmountsOut

        let calc0 = new AmountCalculator(prices0, slippageTolerance)
        let calc1 = new AmountCalculator(prices1, slippageTolerance)

        // 3. Determine profitability





        // var smartPairs: any = {}
        // for (let i = 1; i < pair.pair.length; i++) {
        //     const factoryID = pair.pair[i].factoryID;
        //     const exchangeName = `exchange${i + 1}`
        //     const exchangePairs = pair[i]
        //     smartPairs[exchangeName] = new SmartPair(exchangePairs, slippageTolerance)
        // };

        // var reserves: any = {}
        // for (const exchangeName in smartPairs) {
        //     const sp = smartPairs[exchangeName];
        //     reserves[exchangeName] = new Reserves(sp)
        // }

        // var r: any = {};
        // for (const exchangeName in reserves) {
        //     r[exchangeName] = reserves[exchangeName];
        //     let rData = await r.getReserves(reserves[exchangeName].sp[exchangeName].poolID);
        // }

        // // Calculate AmountsOut for each SmartPair
        // var calculator = new AmountCalculator(reserves,);

        // var trade = await getTradefromAmounts(
        //     calculator.amountOut,
        //     calculator.amountOutAjs,
        //     calculator.amountOutB,
        //     calculator.amountOutBjs,
        //     calculator.amountRepayA,
        //     calculator.amountRepayAjs,
        //     calculator.amountRepayB,
        //     calculator.amountRepayBjs,
        //     ra.priceOutBN,
        //     rb.priceOutBN,
        //     ra.reserveInBN,
        //     ra.reserveOutBN,
        //     ra.reserveIn,
        //     ra.reserveOut,
        //     rb.reserveInBN,
        //     rb.reserveOutBN,
        //     rb.reserveIn,
        //     rb.reserveOut,
        //     sp.exchangeA,
        //     sp.exchangeB,
        //     await sp.getPoolAId(),
        //     await sp.getPoolBId(),
        //     factoryA_id,
        //     factoryB_id,
        //     routerA_id,
        //     routerB_id,
        // )

        // let amountOutLoanPool = trade.loanPool.amountOut
        // let amountOutRecipient = trade.recipient.amountOut
        // let amountRepayLoanPool = trade.loanPool.amountRepay
        // let amountRepayRecipient = trade.recipient.amountRepay

        // let amountOutLoanPooljs = trade.loanPool.amountOutjs
        // let amountOutRecipientjs = trade.recipient.amountOutjs
        // let amountRepayLoanPooljs = trade.loanPool.amountRepayjs
        // let amountRepayRecipientjs = trade.recipient.amountRepayjs

        // let hilo = await calculator.getHilo();
        // let difference = await calculator.getDifference();


        // let differencePrice = hilo.higher.minus(hilo.lower)//higher.sub(lower)
        // let differencePercent = differencePrice.dividedBy(hilo.higher).multipliedBy(BN(100))//difference.div(higher).mul(BigNumber.from(100))
        // // liq.greater = BN.max(ra.reserveIn, rb.reserveIn)

        // var differenceOut = amountOutRecipient.minus(amountOutLoanPool)

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
    });
}
provider.on('block', async (blockNumber: any) => {
    console.log('New block received:::::::::::::::::: Block # ' + blockNumber + ":::::::::::::::")
    compare();
});