//TODO: THIS DOC will be altered to use a direct repayment strategy, rather than corresponding, since I can't figure out why the repayment of the loan is never 0.3% therefore unpredictable.
//TODO: ADD unsiwapV3 support


//IMPORTS
import { filter } from '../utils/dexdata/comparev2';
require('dotenv').config()//for importing parameters
require('colors')//for console output
import { uniswapRouter, uniswapFactory, gasToken, deployedMap } from '../constants/addresses';
import { provider, flash } from '../constants/contract';
import Web3 from 'web3';
import { BigNumber, ethers, utils } from 'ethers';
import { BigNumber as BN } from "bignumber.js";
import fs from 'fs';

import { sendit } from './execute';
import { V2Quote, V2Input } from '../utils/price/uniswap/getPrice';
import { wallet } from '../constants/contract';
//ABIs
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
//trade interface
import { BoolFlash, Trade } from '../constants/interfaces';

import { lowSlippage } from './modules/lowslipBN';
import { getAmountsIn, getAmountsOut, getAmountsIO } from './modules/getAmountsIO';
import { getAmountsIn as getAmountsInjs, getAmountsOut as getAmountsOutjs, getAmountsIO as getAmountsIOjs } from './modules/getAmountsIOjs';
import { getTradefromAmounts } from './modules/populateTrade';
import { fetchGasPrice } from "./modules/fetchGasPrice";
import { gasVprofit } from './modules/gasVprofit';
import { calculateLoanCost } from './modules/loanCost'
// import { getReserves } from './modules/getReseverves';
const factoryB_id = uniswapFactory.SUSHI
const routerB_id = uniswapRouter.SUSHI
const factoryA_id = uniswapFactory.QUICK
const routerA_id = uniswapRouter.QUICK

import * as log4js from "log4js";
import { exec } from 'child_process';
import { boolean } from 'hardhat/internal/core/params/argumentTypes';
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

// const interval = 4 * 2000
// const inverval = provider.on('block', async (blockNumber: any) => {})

if (process.env.PRIVATE_KEY === undefined) {
    throw new Error("Private key is not defined");
}
//TODO: CREATE convertToGas function to compare token1 profit to gas cost, to determine profitability of trade.

////////////////////////////////////INITIALIZE CONTRACTS////////////////////////////////////
const factoryA = new ethers.Contract(factoryA_id, IFactory, wallet)
const factoryB = new ethers.Contract(factoryB_id, IFactory, wallet)
let warning = 0
let tradePending = false;
const deadline = Math.round(Date.now() / 1000) + 1000 * 60
//0.0025 * 100 = 0.25%
export async function flashit() {
    let arrayV2V2 = await filter();
    arrayV2V2?.forEach(async (pool: any) => {
        console.log("Pair: " + pool.pair.ticker + " Starting New Loop:")
        try {
            var virtualReserveFactor = 1.1
            var slippageTolerance = BN(0.01);//smaller slippage == smaller sized trades == more opportunities, though maybe not profitable.
            var tokenInsymbol = pool.pair.token0symbol
            var tokenOutsymbol = pool.pair.token1symbol
            var tokenInID = pool.pair.token0
            var tokenOutID = pool.pair.token1
            var tokenIndec = pool.pair.token0decimals
            var tokenOutdec = pool.pair.token1decimals
            var ticker = tokenInsymbol + "/" + tokenOutsymbol

            var poolA_id = await factoryA.getPair(tokenInID, tokenOutID);
            var poolB_id = await factoryB.getPair(tokenInID, tokenOutID);

            var exchangeA = 'QUICK'
            var exchangeB = 'SUSHI'

            var Pair0 = new ethers.Contract(poolA_id, IPair, wallet);
            var Pair1 = new ethers.Contract(poolB_id, IPair, wallet);

            var aReserves, aReserveIn: any, aReserveOut: any, bReserves: any, bReserveIn: any, bReserveOut: any

            if (Pair0.ID != '0x0000000000000000000000000000000000000000') {
                aReserves = await Pair0.getReserves().catch((error: any) => {
                    logger.error("Error (getReserves(" + exchangeA + ")): " + error)
                    logger.error(error)
                });
            } else {
                console.log("Pair0 " + ticker + " no longer exists on " + exchangeA + "!")
                return
            }

            // Using bignumber.js to format reserves and price instead of ethers.js BigNumber implementation:
            var aReserveIn = aReserves[0]
            var aReserveOut = aReserves[1]
            var aReserveInFormatted = (utils.formatUnits(aReserveIn, tokenIndec).toString())
            var aReserveOutFormatted = (utils.formatUnits(aReserveOut, tokenOutdec).toString())
            var aReserveInBN = new BN(aReserveInFormatted)
            var aReserveOutBN = new BN(aReserveOutFormatted)
            let aPriceInBN = new BN(aReserveInFormatted).div(aReserveOutFormatted)
            let aPriceOutBN = new BN(aReserveOutFormatted).div(aReserveInFormatted)

            if (Pair1.ID != '0x0000000000000000000000000000000000000000') {
                bReserves = await Pair1.getReserves().catch((error: any) => {
                    logger.error("Error (getReserves(" + exchangeB + ")): ")
                    logger.error(error)
                });
            } else {
                console.log("Pair1 " + ticker + " no longer exists on " + exchangeB + "!")
                return
            }

            //Exchange B pricing and reserves
            var bReserveIn = bReserves[0]
            var bReserveOut = bReserves[1]
            var bReserveInFormatted = (utils.formatUnits(bReserveIn, tokenIndec).toString())
            var bReserveOutFormatted = (utils.formatUnits(bReserveOut, tokenOutdec).toString())
            var bReserveInBN = new BN(bReserveInFormatted)
            var bReserveOutBN = new BN(bReserveOutFormatted)
            let bPriceInBN = new BN(bReserveInFormatted).div(bReserveOutFormatted)
            let bPriceOutBN = new BN(bReserveOutFormatted).div(bReserveInFormatted)


            let hilo = await getHiLo(aPriceOutBN, bPriceOutBN)
            // let liq = await getGreaterLesser(aReserveInBN, bReserveInBN)
            let difference = await getDifference(hilo.higher, hilo.lower)
            let amountlowSlippageA = (await lowSlippage(aReserveInBN, aReserveOutBN, aPriceOutBN, slippageTolerance, /*virtualReserveFactor*/))
            let amountLowSlippageB = (await lowSlippage(bReserveInBN, bReserveOutBN, bPriceOutBN, slippageTolerance))

            const amountInA = amountlowSlippageA.toFixed(tokenIndec)
            const amountInB = amountLowSlippageB.toFixed(tokenIndec)

            var amountInTrade = BN.min(amountInA, amountInB).toFixed(tokenIndec)
            console.log(">>>> CHECK AMOUNTINTRADE: " + amountInTrade) //DEBUG

            let amountIn = utils.parseUnits(amountInTrade, tokenIndec)

            //Filter low liquidity pairs
            if (BN(difference.difference).gt(BN(0)) && aReserveInBN.gt(BN(4)) && aReserveOutBN.gt(BN(4)) && bReserveInBN.gt(BN(4)) && bReserveOutBN.gt(BN(4))) {

                let amountOutAjs = getAmountsOutjs(amountIn, aReserveIn, aReserveOut) //you get this much out for amountIn in, so you need amountin + 3.09% to repay loan.
                let amountOutBjs = getAmountsOutjs(amountIn, bReserveIn, bReserveOut)

                let amountRepayAjs = getAmountsInjs(amountIn, aReserveOut, aReserveIn)
                let amountRepayBjs = getAmountsInjs(amountIn, bReserveOut, bReserveIn)

                //DAIReservePre - DAIWithdrawn + (DAIReturned * .997) >= DAIReservePre//
                let amountDirectRepayAjs = amountIn.mul(1000).div(997) // = 
                // let amountDirectRepayBjs = getAmountsInjs(amountOutAjs, bReserveIn, bReserveOut)

                let amountOutA = BN(utils.formatUnits(amountOutAjs, tokenOutdec))
                let amountOutB = BN(utils.formatUnits(amountOutBjs, tokenOutdec))

                let amountRepayA = BN(utils.formatUnits(amountRepayAjs, tokenOutdec))
                let amountRepayB = BN(utils.formatUnits(amountRepayBjs, tokenOutdec))

                let amountDirectRepayA = BN(utils.formatUnits(amountDirectRepayAjs, tokenIndec))
                // let amountDirectRepayB = BN(utils.formatUnits(amountDirectRepayBjs, tokenIndec))

                hilo = await getHiLo(amountOutA, amountOutB)
                // return

                var trade = await getTradefromAmounts(
                    amountOutA,
                    amountOutAjs,
                    amountOutB,
                    amountOutBjs,
                    amountRepayA,
                    amountRepayAjs,
                    amountRepayB,
                    amountRepayBjs,
                    aPriceOutBN,
                    bPriceOutBN,
                    aReserveInBN,
                    aReserveOutBN,
                    aReserveIn,
                    aReserveOut,
                    bReserveInBN,
                    bReserveOutBN,
                    bReserveIn,
                    bReserveOut,
                    exchangeA,
                    exchangeB,
                    poolA_id,
                    poolB_id,
                    factoryA_id,
                    factoryB_id,
                    routerA_id,
                    routerB_id,)

                let amountOutLoanPool = trade.loanPool.amountOut
                let amountOutRecipient = trade.recipient.amountOut
                let amountRepayLoanPool = trade.loanPool.amountRepay
                let amountRepayRecipient = trade.recipient.amountRepay

                let amountOutLoanPooljs = trade.loanPool.amountOutjs
                let amountOutRecipientjs = trade.recipient.amountOutjs
                let amountRepayLoanPooljs = trade.loanPool.amountRepayjs
                let amountRepayRecipientjs = trade.recipient.amountRepayjs

                // let liq = await getGreaterLesser(aReserveInBN, bReserveInBN)
                difference = await getDifference(hilo.higher, hilo.lower)


                let differencePrice = hilo.higher.minus(hilo.lower)//higher.sub(lower)
                let differencePercent = differencePrice.dividedBy(hilo.higher).multipliedBy(BN(100))//difference.div(higher).mul(BigNumber.from(100))
                // liq.greater = BN.max(aReserveIn, bReserveIn)

                var differenceOut = amountOutRecipient.minus(amountOutLoanPool)

                let loanCost = await calculateLoanCost(
                    BN(amountInTrade),
                    amountDirectRepayA,
                )
                // const loanCost = loanCostPercent.multipliedBy(100);

                // var loanCost = amountRepayLoanPool.minus(amountOutLoanPool)
                // var loanCostPercent = loanCost.dividedBy(amountOutLoanPool).multipliedBy(100)

                var premium = hilo.higher.minus(hilo.lower)
                var loanprem = premium.div(hilo.higher).multipliedBy(100)

                var profit = amountOutRecipient.minus(amountRepayLoanPool)
                var profitPercent = profit.dividedBy(amountOutRecipient).multipliedBy(100)
                var profitjs = utils.parseUnits(profit.toFixed(tokenOutdec), tokenOutdec)


                const amounts = {
                    direction: trade.direction,
                    loanPool: trade.loanPool.exchange,
                    recipient: trade.recipient.exchange,
                    amountIn: amountInTrade + " " + tokenInsymbol,
                    amountOutLoanPool: amountOutLoanPool.toFixed(tokenOutdec) + " " + tokenOutsymbol,
                    amountOutRecipient: amountOutRecipient.toFixed(tokenOutdec) + " " + tokenOutsymbol,
                    amountRepayLoanPool: amountRepayLoanPool.toFixed(tokenOutdec) + " " + tokenOutsymbol,
                    amountRepayRecipient: amountRepayRecipient.toFixed(tokenOutdec) + " " + tokenOutsymbol,
                    directRepayLoanPool: amountDirectRepayA.toFixed(tokenIndec) + " " + tokenInsymbol,
                    // directRepayRecipient: amountDirectRepayB.toFixed(tokenIndec) + " " + tokenInsymbol,
                    loanPoolPriceOut: trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + tokenOutsymbol + "/" + tokenInsymbol,
                    recipientPriceOut: trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + tokenOutsymbol + "/" + tokenInsymbol,
                    differenceAmountsOut: differencePrice.toFixed(tokenOutdec) + " " + tokenOutsymbol + " (" + differencePercent.toFixed(tokenOutdec) + "%)",
                    differenceOutvsRepay: (differenceOut.toFixed(8) + " " + tokenOutsymbol + " (" + ((differenceOut.dividedBy(amountOutRecipient)).multipliedBy(100)).toFixed(4) + "%)"),
                    projectedProfit: profit.toFixed(tokenOutdec),
                    loanPoolReserves: trade.loanPool.reserveIn.toFixed(tokenIndec) + " " + tokenInsymbol + " " + trade.loanPool.reserveOut.toFixed(tokenOutdec) + " " + tokenOutsymbol,
                    recipientReserves: trade.recipient.reserveIn.toFixed(tokenIndec) + " " + tokenInsymbol + " " + trade.recipient.reserveOut.toFixed(tokenOutdec) + " " + tokenOutsymbol,
                    loanPremium: loanprem.toFixed(18) + "%",
                    loanCost: loanCost.loanCost.toFixed(tokenIndec) + " " + tokenInsymbol + " (" + loanCost.loanCostPercentage.toFixed(6) + "%)",
                    //The following must be equal after the flash loan is repaid.

                    prevloanPoolK: trade.loanPool.reserveIn.multipliedBy(trade.loanPool.reserveOut).toFixed(20),
                    postloanPoolK: (trade.loanPool.reserveIn.minus(amountInTrade)).multipliedBy(trade.loanPool.reserveOut.plus(amountRepayLoanPool)).toFixed(20),
                }
                console.log(amounts)
                const blockNumber = await provider.getBlockNumber();
                // logger.info(amounts)//DEBUG
                return

                let tradejs: BoolFlash = {
                    ticker: ticker,
                    tokenInsymbol: tokenInsymbol,
                    // tokenInPrice: utils.parseUnits(trade.tokenInPrice.toFixed(tokenIndec), tokenIndec),
                    tokenInID: tokenInID,
                    tokenIndec: tokenIndec,
                    tokenOutsymbol: tokenOutsymbol,
                    tokenOutPrice: utils.parseUnits(trade.recipient.tokenOutPrice.toFixed(tokenOutdec), tokenOutdec),
                    tokenOutID: tokenOutID,
                    tokenOutdec: tokenOutdec,
                    amountIn: amountIn,
                    expectedProfit: profitjs,
                    loanPool: {
                        exchange: trade.loanPool.exchange,
                        poolID: trade.loanPool.poolID,
                        // tokenInPrice: utils.parseUnits(trade.loanPool.tokenInPrice.toFixed(tokenIndec), tokenIndec),
                        tokenOutPrice: utils.parseUnits(trade.loanPool.tokenOutPrice.toFixed(tokenOutdec), tokenOutdec),
                        reserveIn: trade.loanPool.reserveInjs,
                        reserveOut: trade.loanPool.reserveOutjs,
                        factoryID: trade.loanPool.factoryID,
                        routerID: trade.loanPool.routerID,
                        amountOut: amountOutLoanPooljs,
                        amountRepay: amountRepayLoanPooljs,
                    },
                    recipient: {
                        exchange: trade.loanPool.exchange,
                        poolID: trade.loanPool.poolID,
                        // tokenInPrice: utils.parseUnits(trade.recipient.tokenInPrice.toFixed(tokenIndec), tokenIndec),
                        tokenOutPrice: utils.parseUnits(trade.recipient.tokenOutPrice.toFixed(tokenOutdec), tokenOutdec),
                        reserveIn: trade.recipient.reserveInjs,
                        reserveOut: trade.recipient.reserveOutjs,
                        factoryID: trade.recipient.factoryID,
                        routerID: trade.recipient.routerID,
                        amountOut: amountOutRecipientjs,
                    },
                }
                // console.log('attaining gas price & profit comparison...')

                async function profitablejs() {
                    const profitablejs = profitPercent.gt(0) ? await gasVprofit(tradejs) : BigNumber.from(0.0)
                    const profitable = BN(utils.formatUnits(profitablejs, tokenOutdec))
                    return profitable
                }
                const profitable = await profitablejs()

                if (profitable.gt((0.0)) && !tradePending) {
                    tradePending = true
                    logger.info("***Sending transaction to flashSwap contract " + ticker + " on block " + blockNumber + "***")
                    logger.info("==============STRATEGY: " + tokenInsymbol + "/" + tokenOutsymbol + "==============")
                    logger.info("amountIn: " + amountInTrade + " " + tokenInsymbol + " (" + trade.direction + ")")
                    logger.info(ticker)
                    logger.info("Price Check:" + ticker)
                    logger.info(amounts)
                    logger.info(trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + tokenInsymbol + "/" + tokenOutsymbol)
                    logger.info(trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + tokenInsymbol + "/" + tokenOutsymbol)
                    logger.info("Borrow: " + amounts.amountIn + " " + tokenInsymbol + " from " + trade.loanPool.exchange)
                    logger.info("Sell for: " + amountOutRecipient + " " + tokenOutsymbol + " on " + trade.recipient.exchange)
                    logger.info("Repay: " + amounts.amountRepayLoanPool + tokenOutsymbol + " to " + trade.loanPool.exchange)
                    logger.info("Loan Fee: " + premium.toFixed(tokenOutdec)/*utils.formatUnits(premium, tokenOutdec)*/ + " " + tokenOutsymbol)
                    logger.info("Slippage Tolerance: " + (Number(slippageTolerance) * 100) + "%")
                    logger.info("Profit:" + profit)
                    logger.info("ProfitPercent: " + profitPercent.toString() + " " + tokenOutsymbol)
                    // logger.info("Profit: " + profit.toFixed(tokenOutdec) + " " +tokenOutsymbol)
                    logger.info("===============================================================")
                    logger.info("Executing Trade on Block: " + blockNumber)
                    logger.info("===============================================================")
                    let gasMult = 1.1
                    let nonce = await provider.getTransactionCount(wallet.address);
                    try {
                        // return//DEBUG
                        await sendit(
                            // profitjs,
                            tradejs,
                            // gasMult,
                            tradePending,
                            nonce);
                        if (tradePending) {
                            logger.info("Trade pending...")
                            tradePending = false;
                        } else {
                            logger.info("Trade failed. Exiting...")
                            tradePending = false;
                        }
                    } catch (error: any) {
                        if (error.code === "INSUFFICIENT_FUNDS") {
                            logger.info('Insufficient funds for gas * price + value')
                            tradePending = false;
                            return
                        }
                        if (error.code === 'TRANSACTION_UNDERPRICED') {
                            gasMult = gasMult++;
                            nonce++;
                            logger.info('Transaction underpriced. Retrying with increased maxFeePerGas...')
                            await sendit(
                                // profitjs, 
                                tradejs,
                                // gasMult, 
                                tradePending,
                                nonce)
                        } if (error.code === `EXCEEDS_BLOCK_GAS_LIMIT`) {
                            logger.error('Tx price exceeds block gas limit. Aborting...')
                            tradePending = false;
                        } if (!tradePending && error.code === 'NONCE_EXPIRED') {
                            logger.info('Nonce too low. Retrying with increased gas...')
                            // nonce++;
                            gasMult++;
                            await sendit(
                                // profitjs,
                                tradejs,
                                // gasMult,
                                tradePending,
                                nonce)
                            tradePending = true
                        } if (tradePending && error.code === 'NONCE_EXPIRED') {
                            // nonce++
                            gasMult++
                            console.log('Nonce too low. Incrementing Gas Price.')
                            tradePending = false
                        } else {
                            logger.error(':::::::::Unhandled Error sending transaction:::::::::')
                            logger.error(error)
                        }
                    }
                } else if (profitPercent.gt((0.0)) && tradePending) {
                    if (warning == 0) {
                        warning++
                        logger.info(ticker + " trade pending. Skipping to next asset...")
                        return
                    } else {
                        return
                    }
                } else if (profitPercent.lt(BN(0.0))) {
                    console.log("==============STRATEGY (UNPROFITABLE): " + tokenInsymbol + "/" + tokenOutsymbol + "==============")
                    // console.log("amountIn: " + amountInTrade + " " + tokenInsymbol + " (" + trade.direction + ")")
                    // console.log(ticker)
                    // console.log("Price Check:" + ticker)
                    // console.log(amounts)
                    // console.log(trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + tokenInsymbol + "/" + tokenOutsymbol)
                    // console.log(trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + tokenInsymbol + "/" + tokenOutsymbol)
                    // console.log("Borrow: " + amounts.amountIn + " " + tokenInsymbol + " from " + trade.loanPool.exchange)
                    // console.log("Sell for: " + amountOutRecipient + " " + tokenOutsymbol + " on " + trade.recipient.exchange)
                    // console.log("Repay: " + amounts.amountRepayLoanPool + tokenOutsymbol + " to " + trade.loanPool.exchange)
                    // console.log("Loan Fee: " + premium.toFixed(tokenOutdec)/*utils.formatUnits(premium, tokenOutdec)*/ + " " + tokenOutsymbol)
                    // console.log("Slippage Tolerance: " + (Number(slippageTolerance) * 100) + "%")
                    // console.log("Profit: " + profitable.toString(tokenOutdec) + " " + tokenOutsymbol)
                    // console.log("Block: " + blockNumber + " No trade executed. Skipping to next asset...")
                    // console.log("===============================================================")
                    return
                }
            } else {
                console.log("Liquidity too low on " + ticker + ". Skipping...")
                return
            }
        } catch (error: any) {
            logger.error("Error (flashit): " + error)
            return
        };
    });
}
provider.on('block', async (blockNumber: any) => {
    console.log('New block received:::::::::::::::::: Block # ' + blockNumber + ":::::::::::::::")
    flashit();
});