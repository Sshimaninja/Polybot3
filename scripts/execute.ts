import { BigNumber, ethers, utils, Contract, Wallet } from "ethers";
import axios from "axios";
import { provider, signer, wallet, flash, logger } from "../constants/contract";
// import { abi as IFlash } from '../artifacts/contracts/flashOne.sol/flashOne.json';
import { BoolFlash } from "../constants/interfaces";
// import { deployedMap } from "../constants/addresses";
import { BigNumber as BN } from "bignumber.js";
import { fetchGasPrice } from "./modules/fetchGasPrice";
import { checkBal, checkGasBal } from "./modules/checkBal";
import { gasVprofit } from "./modules/gasVprofit";

export async function sendit(
    // profit: BigNumber,
    trade: BoolFlash,
    // gasMult: number,
    tradePending: boolean,
    nonce: number
) {
    console.log('::::::::::::::::::::::::::::::::::::::::BEGIN TRANSACTION: ' + trade.ticker + ':::::::::::::::::::::::::: ')
    var gasbalance = await checkGasBal();
    const profitable = await gasVprofit(trade).catch((err: any) => { logger.error('Error in gasVprofit: ' + err) })
    const gasData = await fetchGasPrice(trade)
    if (profitable?.gt(0)) {
        console.log("Wallet Balance Matic: " + ethers.utils.formatUnits(gasbalance, "gwei") + " " + "MATIC Gwei")
        const gotGas = Number(gasData.gasPrice) < Number(gasbalance)
        gotGas == true ? console.log("Sufficient Matic Balance. Proceeding...") : console.log(">>>>Insufficient Matic Balance<<<<")
        if (gotGas == false) {
            console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION: " + trade.ticker + ':::::::::::::::::::::::::: ')
            return
        }
        console.log(":::::::::::Sending Transaction::::::::::: ")
        tradePending = true;
        let tx = await flash.flashSwap(
            trade.loanPool.factoryID,
            trade.recipient.routerID,
            trade.tokenInID,
            trade.tokenOutID,
            trade.amountIn,
            trade.recipient.amountOut,
            trade.loanPool.amountRepay,
            {
                type: 2,
                // gasPrice: gasLimit,
                maxFeePerGas: gasData.maxFee,
                maxPriorityFeePerGas: gasData.maxPriorityFee,
                gasLimit: gasData.gasEstimate,
                nonce: nonce,
            }
        );
        console.log("Sending Transaction...")
        const signedTx = await wallet.signTransaction(tx);
        const txResponse = await provider.sendTransaction(signedTx);
        logger.info("Transaction hash: " + txResponse.hash)
        txResponse.wait()
            .then((receipt: any) => {
                logger.info("Transaction receipt: ")
                logger.info(receipt)
                logger.info("Transaction complete")
                tradePending = false;
            });
        var filter = {
            address: flash.address,
            topics: [
                utils.id("log(string,uint256)"),
                utils.id("logValue(string,uint256)"),
                utils.id("logAddress(string,address)"),
            ]
        }
        provider.on(filter, (log, logValue, logAddress) => {
            logger.info(log)
            logger.info(logValue)
            logger.info(logAddress)
        });
        provider.once(txResponse.hash, (transaction) => {
            logger.info(txResponse.hash)
            logger.info(transaction)
        })
        const bal = await checkBal(trade.tokenInID, trade.tokenIndec, trade.tokenOutID, trade.tokenOutdec)
        console.log("New wallet balance: ")
        console.log(bal)
        console.log("Transaction Sent. Await Confirmation...")
        console.log("Transaction Hash: " + txResponse.hash)
        logger.info(txResponse)
        tradePending = true;
        if (txResponse == undefined) {
            logger.info("Transaction sent to flashSwap contract")
            logger.info("Transaction response: ")
            logger.info(txResponse)
            tradePending = true
            logger.info("===============================================================")
            return { tradePending };
        } else {
            logger.error("=====================Transaction Error=====================")
            tradePending = false
        }
        console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")
        return { tradePending };
    } else {
        console.log(":::::::::::::::::::::::::::::::::GAS COST > PROFIT: " + trade.ticker + ":::::::::::::::::::::: ")
        console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")
        return { tradePending };
    }
}

