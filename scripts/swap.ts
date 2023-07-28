//IMPORTS
// import { V2V2SORT } from '../utils/dexdata/V2V2/comparev2';
require('dotenv').config()//for importing parameters
require('colors')//for console output
import { uniswapRouter, uniswapFactory, gasToken, deployedMap } from '../constants/addresses';
import { provider, flash } from '../constants/contract';
import Web3 from 'web3';
import { BigNumber, ethers, utils } from 'ethers';
import { BigNumber as BN } from "bignumber.js";
import fs from 'fs';

import { SmartPool } from './modules/smartPool';


import { sendit } from './execute';
// import { V2Quote, V2Input } from '../utils/price/uniswap/v2/getPrice';
import { wallet } from '../constants/contract';
//ABIs
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
//trade interface
import { BoolFlash, Trade, HiLo, Difference } from '../constants/interfaces';

import { lowSlippage } from './modules/lowslipBN';
import { getAmountsIn, getAmountsOut, getAmountsIO } from './modules/getAmountsIO';
import { getAmountsIn as getAmountsInjs, getAmountsOut as getAmountsOutjs, getAmountsIO as getAmountsIOjs } from './modules/getAmountsIOjs';
import { AmountCalculator } from './amountCalculator'
import { TradeMsg } from './modules/tradeMsg';
import { getTradefromAmounts } from './modules/populateTrade';
import { fetchGasPrice } from "./modules/fetchGasPrice";
import { gasVprofit } from './modules/gasVprofit';
import { calculateLoanCost } from './modules/loanCost'
import { Reserves } from './modules/reserves';
// import { getReserves } from './modules/getReseverves';
const factoryB_id = uniswapFactory.SUSHI
const routerB_id = uniswapRouter.SUSHI
const factoryA_id = uniswapFactory.QUICK
const routerA_id = uniswapRouter.QUICK


import * as log4js from "log4js";
import { exec } from 'child_process';
import { boolean } from 'hardhat/internal/core/params/argumentTypes';
import { getDifference, getGreaterLesser, getHiLo } from './modules/getHiLo';
import { filter } from '../utils/dexdata/comparev2';

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
        // console.log("Pair: " + pool.pair.ticker + " Starting New Loop:")
        try {
            var virtualReserveFactor = 1.1
            var sp = new SmartPool(pool, BN(0.01));
            var r = new Reserves(sp);

            let rap = r.getReserves(0);
            let rbp = r.getReserves(1);
            let ra = await rap;
            let rb = await rbp;
            if (ra === null || rb === null) {
                return;
            }


            var calculator = new AmountCalculator(ra, rb);

            //Filter low liquidity pairs
            if (await calculator.checkLiquidity()) {

                var trade = await getTradefromAmounts(
                    calculator.amountOutA,
                    calculator.amountOutAjs,
                    calculator.amountOutB,
                    calculator.amountOutBjs,
                    calculator.amountRepayA,
                    calculator.amountRepayAjs,
                    calculator.amountRepayB,
                    calculator.amountRepayBjs,
                    ra.priceOutBN,
                    rb.priceOutBN,
                    ra.reserveInBN,
                    ra.reserveOutBN,
                    ra.reserveIn,
                    ra.reserveOut,
                    rb.reserveInBN,
                    rb.reserveOutBN,
                    rb.reserveIn,
                    rb.reserveOut,
                    sp.exchangeA,
                    sp.exchangeB,
                    await sp.getPoolAId(),
                    await sp.getPoolBId(),
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

                let hilo = await calculator.getHilo();
                let difference = await calculator.getDifference();


                let differencePrice = hilo.higher.minus(hilo.lower)//higher.sub(lower)
                let differencePercent = differencePrice.dividedBy(hilo.higher).multipliedBy(BN(100))//difference.div(higher).mul(BigNumber.from(100))
                // liq.greater = BN.max(ra.reserveIn, rb.reserveIn)

                var differenceOut = amountOutRecipient.minus(amountOutLoanPool)

                let loanCost = await calculateLoanCost(
                    amountOutLoanPool,
                    amountRepayLoanPool
                )
                // const loanCost = loanCostPercent.multipliedBy(100);

                // var loanCost = amountRepayLoanPool.minus(amountOutLoanPool)
                // var loanCostPercent = loanCost.dividedBy(amountOutLoanPool).multipliedBy(100)

                var premium = hilo.higher.minus(hilo.lower)
                var loanprem = premium.div(hilo.higher).multipliedBy(100)

                var profit = amountOutRecipient.minus(amountRepayLoanPool)
                var profitPercent = profit.dividedBy(amountOutRecipient).multipliedBy(100)
                var profitjs = utils.parseUnits(profit.toFixed(sp.tokenOutdec), sp.tokenOutdec)

                // var amounts = new amountsObject()
                const blockNumber = await provider.getBlockNumber();
                // logger.info(amounts)//DEBUG
                // return

                let tradejs: BoolFlash = {
                    ticker: sp.ticker,
                    tokenInsymbol: sp.tokenInsymbol,
                    // tokenInPrice: utils.parseUnits(trade.tokenInPrice.toFixed(tokenIndec), tokenIndec),
                    tokenInID: sp.tokenInID,
                    tokenIndec: sp.tokenIndec,
                    tokenOutsymbol: sp.tokenOutsymbol,
                    tokenOutPrice: utils.parseUnits(trade.recipient.tokenOutPrice.toFixed(sp.tokenOutdec), sp.tokenOutdec),
                    tokenOutID: sp.tokenOutID,
                    tokenOutdec: sp.tokenOutdec,
                    amountIn: calculator.amountIn,
                    expectedProfit: profitjs,
                    loanPool: {
                        exchange: trade.loanPool.exchange,
                        poolID: trade.loanPool.poolID,
                        // tokenInPrice: utils.parseUnits(trade.loanPool.tokenInPrice.toFixed(tokenIndec), tokenIndec),
                        tokenOutPrice: utils.parseUnits(trade.loanPool.tokenOutPrice.toFixed(sp.tokenOutdec), sp.tokenOutdec),
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
                        tokenOutPrice: utils.parseUnits(trade.recipient.tokenOutPrice.toFixed(sp.tokenOutdec), sp.tokenOutdec),
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
                    const profitable = BN(utils.formatUnits(profitablejs, sp.tokenOutdec))
                    return profitable
                }
                const profitable = await profitablejs()
                var tradeMessage = new TradeMsg(sp, trade)

                if (profitable.gt((0.0)) && !tradePending) {
                    tradePending = true
                    logger.info(tradeMessage)
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
                            tradePending = true;
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
                        logger.info(sp.ticker + " trade pending. Skipping to next asset...")
                        return
                    } else {
                        return
                    }
                } else if (profitPercent.lt(BN(0.0))) {
                    console.log("==============STRATEGY (UNPROFITABLE): " + sp.tokenInsymbol + "/" + sp.tokenOutsymbol + "==============")
                    console.log(tradeMessage)
                    return
                }
            } else {
                console.log("Liquidity too low on " + sp.ticker + ". Skipping...")
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