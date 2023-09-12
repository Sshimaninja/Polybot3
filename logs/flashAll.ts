//IMPORTS
import { V2V2SORT } from '../utils/dexdata/V2/comparev2';
require('dotenv').config()//for importing parameters
require('colors')//for console output
import { uniswapRouter, uniswapFactory, gasToken, deployedMap } from '../constants/addresses';
import { provider, flash } from '../constants/contract';
import Web3 from 'web3';
import { BigNumber, ethers, utils } from 'ethers';
import { BigNumber as BN } from "bignumber.js";
import fs from 'fs';

import { sendit } from '../scripts/execute';
import { V2Quote, V2Input } from '../utils/price/uniswap/getPrice';
import { wallet } from '../constants/contract';
//ABIs
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
//trade interface
import { Flash, Trade } from '../constants/interfaces';

import { lowSlippage } from '../scripts/modules/equalizeRatioBN';
import { getAmountsIn, getAmountsOut, getAmountsIO } from '../scripts/modules/getAmountsIO';
import { getAmountsIn as getAmountsInjs, getAmountsOut as getAmountsOutjs, getAmountsIO as getAmountsIOjs } from '../scripts/modules/getAmountsIOjs';
import { getTrade } from '../scripts/modules/populateMultiTrade';
import { getDirection } from '../scripts/modules/getDirection'
import { fetchGasPrice } from "../scripts/modules/fetchGasPrice";
import { gasVprofit } from '../scripts/modules/gasVprofit';
// import { getReserves } from './modules/getReseverves';
const factoryB_id = uniswapFactory.SUSHI
const routerB_id = uniswapRouter.SUSHI
const factoryA_id = uniswapFactory.QUICK
const routerA_id = uniswapRouter.QUICK

import * as log4js from "log4js";
import { exec } from 'child_process';
import { boolean } from 'hardhat/internal/core/params/argumentTypes';
import { getDifference, getGreaterLesser, getHiLo } from '../scripts/modules/getHiLo';
import { calculateLoanCost } from '../scripts/modules/loanCost';
log4js.configure({
    appenders: {
        flashit: { type: "file", filename: "flashit.log", layout: { type: "pattern", pattern: "%d %p %m" } },
        out: { type: "stdout", layout: { type: "pattern", pattern: "%d %p %[%m%]" } }
    },
    categories: { default: { appenders: ["flashit", "out"], level: "info" } },
});

const logger = log4js.getLogger();
// logger.level = "info";
logger.debug("Logging Debug");
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
    let arrayV2V2 = await V2V2SORT();
    arrayV2V2?.forEach(async (pool: any) => {
        // console.log("Pair: " + pool.pair.ticker + " Starting New Loop:")
        // try {
        var virtualReserveFactor = 1.1
        var slippageTolerance = BN(0.006);//smaller slippage == smaller sized trades == more opportunities, though maybe not profitable.
        var token0symbol = pool.pair.token0symbol
        var token1symbol = pool.pair.token1symbol
        var token0ID = pool.pair.token0
        var token1ID = pool.pair.token1
        var token0dec = pool.pair.token0decimals
        var token1dec = pool.pair.token1decimals
        var ticker = token0symbol + "/" + token1symbol

        var poolA_id = await factoryA.getPair(token0ID, token1ID);
        var poolB_id = await factoryB.getPair(token0ID, token1ID);

        var exchangeA = 'QUICK'
        var exchangeB = 'SUSHI'

        var Pair0 = new ethers.Contract(poolA_id, IPair, wallet);
        var Pair1 = new ethers.Contract(poolB_id, IPair, wallet);

        var aReserves, aReserve0: any, aReserve1: any, bReserves: any, bReserve0: any, bReserve1: any

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
        var aReserve0 = aReserves[0]
        var aReserve1 = aReserves[1]
        var aReserve0Formatted = (utils.formatUnits(aReserve0, token0dec).toString())
        var aReserve1Formatted = (utils.formatUnits(aReserve1, token1dec).toString())
        var aReserve0BN = new BN(aReserve0Formatted)
        var aReserve1BN = new BN(aReserve1Formatted)
        let aPrice0BN = new BN(aReserve0Formatted).div(aReserve1Formatted)
        let aPrice1BN = new BN(aReserve1Formatted).div(aReserve0Formatted)

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
        var bReserve0 = bReserves[0]
        var bReserve1 = bReserves[1]
        var bReserve0Formatted = (utils.formatUnits(bReserve0, token0dec).toString())
        var bReserve1Formatted = (utils.formatUnits(bReserve1, token1dec).toString())
        var bReserve0BN = new BN(bReserve0Formatted)
        var bReserve1BN = new BN(bReserve1Formatted)
        let bPrice0BN = new BN(bReserve0Formatted).div(bReserve1Formatted)
        let bPrice1BN = new BN(bReserve1Formatted).div(bReserve0Formatted)

        let hilo = await getHiLo(aPrice0BN, bPrice0BN)
        // let liq = await getGreaterLesser(aReserveInBN, bReserveInBN)
        let difference = await getDifference(hilo.higher, hilo.lower)
        // console.log("+++++++++++++++++TRADE DIRECTION (1st PASS): " + ticker + "+++++++++++++++++++\n" + JSON.stringify(trade, null, 4) + "\n++++++++++++++++++++++++++++++++++++++++++++++++++++++\n")
        let amountlowSlippageA = (await lowSlippage(aReserve0BN, aReserve1BN, aPrice1BN, slippageTolerance, /*virtualReserveFactor*/))
        let amountLowSlippageB = (await lowSlippage(bReserve0BN, bReserve1BN, bPrice1BN, slippageTolerance))

        const amountInA = amountlowSlippageA.toFixed(token0dec)
        const amountInB = amountLowSlippageB.toFixed(token0dec)
        // console.log(">>>> CHECK AMOUNTINTRADE: " + amountInTrade) //DEBUG

        var amountInTrade = BN.min(amountInA, amountInB).toFixed(token0dec)
        let amountIn = utils.parseUnits(amountInTrade, token0dec)

        //Filter low liquidity pairs
        if (BN(difference.differencePercent).gt(BN(0)) && aReserve0BN.gt(BN(4)) && aReserve1BN.gt(BN(4)) && bReserve0BN.gt(BN(4)) && bReserve1BN.gt(BN(4))) {

            // console.log("amountInBN: " + amountInTrade)
            // console.log("amountInBigNumber: " + amountIn)
            // console.log("amountInjs: " + utils.formatUnits(amountIn, tokenIndec))

            // let amountOutLoanPoolABI = await V2Quote(tokenInID, tokenOutID, amountIn, trade.loanPool.routerID)
            // let amountOutRecipientABI = await V2Quote(tokenInID, tokenOutID, amountIn, trade.recipient.routerID)
            // console.log("amountOutLoanPoolABI: " + utils.formatUnits(amountOutLoanPoolABI, tokenOutdec))
            // console.log("amountOutRecipientABI: " + utils.formatUnits(amountOutRecipientABI, tokenOutdec))


            // let amountRepayLoanPoolABI = await V2Input(tokenOutID, tokenInID, amountIn, trade.loanPool.routerID)
            // let amountRepayRecipientABI = await V2Input(tokenOutID, tokenInID, amountIn, trade.recipient.routerID)
            // console.log("amountRepayLoanPoolABI: " + utils.formatUnits(amountRepayLoanPoolABI, tokenOutdec))
            // console.log("amountRepayRecipientABI: " + utils.formatUnits(amountRepayRecipientABI, tokenOutdec))

            let amountOutAjs = await getAmountsOutjs(amountIn, aReserve0, aReserve1)
            let amountOutBjs = await getAmountsOutjs(amountIn, bReserve0, bReserve1)

            let amountRepayAjs = await getAmountsInjs(amountIn, aReserve1, aReserve1)
            let amountRepayBjs = await getAmountsInjs(amountIn, bReserve0, bReserve0)

            let amountOutA = BN(utils.formatUnits(amountOutAjs, token1dec))
            let amountOutB = BN(utils.formatUnits(amountOutBjs, token1dec))
            let amountRepayA = BN(utils.formatUnits(amountRepayAjs, token1dec))
            let amountRepayB = BN(utils.formatUnits(amountRepayBjs, token1dec))

            hilo = await getHiLo(amountOutA, amountOutB)
            // return

            var trade = await getDirection(
                token0ID,
                token0symbol,
                token0dec,
                token1ID,
                token1symbol,
                token1dec,
                BN(amountInTrade),
                amountOutA,
                amountOutAjs,
                amountOutB,
                amountOutBjs,
                amountRepayA,
                amountRepayAjs,
                amountRepayB,
                amountRepayBjs,
                aPrice0BN,
                bPrice0BN,
                aPrice1BN,
                bPrice1BN,
                aReserve0BN,
                aReserve1BN,
                aReserve0,
                aReserve1,
                bReserve0BN,
                bReserve1BN,
                bReserve0,
                bReserve1,
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

            let loanCostPercent = await calculateLoanCost(
                BN(amountInTrade),
                amountRepayLoanPool
            )
            const loanCost = loanCostPercent.multipliedBy(100);
            var premium = hilo.higher.minus(hilo.lower)
            var loanprem = premium.div(hilo.higher).multipliedBy(100)

            var profit = amountOutRecipient.minus(amountRepayLoanPool)
            var profitPercent = profit.dividedBy(amountOutRecipient).multipliedBy(100)
            var profitjs = utils.parseUnits(profit.toFixed(trade.tokenOutdec), trade.tokenOutdec)


            const amounts = {
                direction: trade.direction,
                loanPool: trade.loanPool.exchange,
                recipient: trade.recipient.exchange,
                loanPoolPriceIn: trade.loanPool.exchange + ": " + trade.loanPool.tokenInPrice + " " + trade.tokenInsymbol + "/" + trade.tokenOutsymbol,
                loanPoolPriceOut: trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + trade.tokenOutsymbol + "/" + trade.tokenInsymbol,
                recipientPriceIn: trade.recipient.exchange + ": " + trade.recipient.tokenInPrice + " " + trade.tokenInsymbol + "/" + trade.tokenOutsymbol,
                recipientPriceOut: trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + trade.tokenOutsymbol + "/" + trade.tokenInsymbol,
                amountIn: amountInTrade + " " + trade.tokenInsymbol,
                amountOutLoanPool: amountOutLoanPool.toString() + " " + trade.tokenOutsymbol,
                amountOutRecipient: amountOutRecipient.toString() + " " + trade.tokenOutsymbol,
                differenceAmountsOut: differencePrice.toFixed(trade.tokenOutdec) + " " + trade.tokenOutsymbol + " (" + differencePercent.toFixed(trade.tokenOutdec) + "%)",
                differenceOutvsRepay: (differenceOut.toFixed(8) + " " + trade.tokenOutsymbol + " (" + ((differenceOut.dividedBy(amountOutRecipient)).multipliedBy(100)).toFixed(4) + "%)"),
                projectedProfit: profit.toFixed(trade.tokenOutdec),
                amountRepayLoanPool: amountRepayLoanPool + " " + trade.tokenOutsymbol,
                // amountRepayLoanPoolABI: amountOutLoanPoolABI + " " + trade.tokenOutsymbol,
                amountRepayRecipient: amountRepayRecipient + " " + trade.tokenOutsymbol,
                // amountRepayRecipientABI: amountOutRecipientABI + " " + trade.tokenOutsymbol,
                loanPoolReserves: trade.loanPool.reserveIn.toFixed(trade.tokenIndec) + " " + trade.tokenInsymbol + " " + trade.loanPool.reserveOut.toFixed(trade.tokenOutdec) + " " + trade.tokenOutsymbol,
                recipientReserves: trade.recipient.reserveIn.toFixed(trade.tokenIndec) + " " + trade.tokenInsymbol + " " + trade.recipient.reserveOut.toFixed(trade.tokenOutdec) + " " + trade.tokenOutsymbol,
                loanPremium: loanprem.toFixed(6) + "%",
                loanCost: loanCost.toFixed(trade.tokenOutdec) + " " + trade.tokenOutsymbol + " (" + loanCostPercent.toFixed(6) + "%)",
                //The following must be equal after the flash loan is repaid.

                prevloanPoolK: trade.loanPool.reserveIn.multipliedBy(trade.loanPool.reserveOut).toFixed(20),
                postloanPoolK: (trade.loanPool.reserveIn.minus(amountInTrade)).multipliedBy(trade.loanPool.reserveOut.plus(amountRepayLoanPool)).toFixed(20),
            }
            const blockNumber = await provider.getBlockNumber();
            logger.info(amounts)//DEBUG


            let tradejs: Flash = {
                ticker: ticker,
                tokenInsymbol: trade.tokenInsymbol,
                tokenInPrice: utils.parseUnits(trade.tokenInPrice.toFixed(trade.tokenIndec), trade.tokenIndec),
                tokenInID: trade.tokenInID,
                tokenIndec: trade.tokenIndec,
                tokenOutsymbol: trade.tokenOutsymbol,
                tokenOutPrice: utils.parseUnits(trade.tokenOutPrice.toFixed(trade.tokenOutdec), trade.tokenOutdec),
                tokenOutID: trade.tokenOutID,
                tokenOutdec: trade.tokenOutdec,
                amountIn: amountIn,
                expectedProfit: profitjs,
                loanPool: {
                    exchange: trade.loanPool.exchange,
                    poolID: trade.loanPool.poolID,
                    tokenInPrice: utils.parseUnits(trade.loanPool.tokenInPrice.toFixed(trade.tokenIndec), trade.tokenIndec),
                    tokenOutPrice: utils.parseUnits(trade.loanPool.tokenOutPrice.toFixed(trade.tokenOutdec), trade.tokenOutdec),
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
                    tokenInPrice: utils.parseUnits(trade.recipient.tokenInPrice.toFixed(trade.tokenIndec), trade.tokenIndec),
                    tokenOutPrice: utils.parseUnits(trade.recipient.tokenOutPrice.toFixed(trade.tokenOutdec), trade.tokenOutdec),
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
                const profitable = BN(utils.formatUnits(profitablejs, trade.tokenOutdec))
                return profitable
            }
            const profitable = await profitablejs()

            if (profitable.gt((0.0)) && !tradePending) {
                tradePending = true
                logger.info("***Sending transaction to flashSwap contract " + ticker + " on block " + blockNumber + "***")
                logger.info("==============STRATEGY: " + trade.tokenInsymbol + "/" + trade.tokenOutsymbol + "==============")
                logger.info("amountIn: " + amountInTrade + " " + trade.tokenInsymbol + " (" + trade.direction + ")")
                logger.info(ticker)
                logger.info("Price Check:" + ticker)
                logger.info(amounts)
                logger.info(trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + trade.tokenInsymbol + "/" + trade.tokenOutsymbol)
                logger.info(trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + trade.tokenInsymbol + "/" + trade.tokenOutsymbol)
                logger.info("Borrow: " + amounts.amountIn + " " + trade.tokenInsymbol + " from " + trade.loanPool.exchange)
                logger.info("Sell for: " + amountOutRecipient + " " + trade.tokenOutsymbol + " on " + trade.recipient.exchange)
                logger.info("Repay: " + amounts.amountRepayLoanPool + trade.tokenOutsymbol + " to " + trade.loanPool.exchange)
                logger.info("Loan Fee: " + premium.toFixed(trade.tokenOutdec)/*utils.formatUnits(premium, token1dec)*/ + " " + trade.tokenOutsymbol)
                logger.info("Slippage Tolerance: " + (Number(slippageTolerance) * 100) + "%")
                logger.info("Profit:" + profit)
                logger.info("Profit: " + profitPercent.toString() + " " + trade.tokenOutsymbol)
                // logger.info("Profit: " + profit.toFixed(trade.tokenOutdec) + " " + trade.tokenOutsymbol)
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
                console.log("==============STRATEGY (UNPROFITABLE): " + trade.tokenInsymbol + "/" + trade.tokenOutsymbol + "==============")
                console.log("amountIn: " + amountInTrade + " " + trade.tokenInsymbol + " (" + trade.direction + ")")
                console.log(ticker)
                console.log("Price Check:" + ticker)
                console.log(amounts)
                console.log(trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + trade.tokenInsymbol + "/" + trade.tokenOutsymbol)
                console.log(trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + trade.tokenInsymbol + "/" + trade.tokenOutsymbol)
                console.log("Borrow: " + amounts.amountIn + " " + trade.tokenInsymbol + " from " + trade.loanPool.exchange)
                console.log("Sell for: " + amountOutRecipient + " " + trade.tokenOutsymbol + " on " + trade.recipient.exchange)
                console.log("Repay: " + amounts.amountRepayLoanPool + trade.tokenOutsymbol + " to " + trade.loanPool.exchange)
                console.log("Loan Fee: " + premium.toFixed(trade.tokenOutdec)/*utils.formatUnits(premium, token1dec)*/ + " " + trade.tokenOutsymbol)
                console.log("Slippage Tolerance: " + (Number(slippageTolerance) * 100) + "%")
                console.log("Profit: " + profitable.toString(trade.tokenOutdec) + " " + trade.tokenOutsymbol)
                console.log("Block: " + blockNumber + " No trade executed. Skipping to next asset...")
                console.log("===============================================================")
                return
            }
        } else {
            console.log("Liquidity too low on " + ticker + ". Skipping...")
            return
        }
    })
};
// provider.on('block', async (blockNumber: any) => {
//     console.log('New block received:::::::::::::::::: Block # ' + blockNumber + ":::::::::::::::")
//     flashit();
// });