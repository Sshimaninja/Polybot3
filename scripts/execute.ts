import { BigNumber, ethers, utils, Contract, Wallet } from "ethers";
import { provider, signer, wallet, logger } from "../constants/contract";
import { BoolTrade, TxData } from "../constants/interfaces";
import { fetchGasPrice } from "./modules/fetchGasPrice";
import { checkBal, checkGasBal } from "./modules/checkBal";

export async function sendit(
    trade: BoolTrade,
    tradePending: boolean,
): Promise<TxData> {
    console.log('::::::::::::::::::::::::::::::::::::::::BEGIN TRANSACTION: ' + trade.ticker + ':::::::::::::::::::::::::: ')
    var gasbalance = await checkGasBal();
    const gasData = await fetchGasPrice(trade)

    let result: TxData = {
        txResponse: undefined,
        tradePending: false,
    }

    if (trade) {

        console.log("Wallet Balance Matic: " + ethers.utils.formatUnits(gasbalance, 18) + " " + "MATIC")

        const gotGas = gasData.gasPrice < gasbalance

        gotGas == true ? console.log("Sufficient Matic Balance. Proceeding...") : console.log(">>>>Insufficient Matic Balance<<<<")

        if (gotGas == false) {
            console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION: " + trade.ticker + ':::::::::::::::::::::::::: ')
            return result;
        }

        console.log(":::::::::::Sending Transaction::::::::::: ")

        result.tradePending = true;

        let tx = await trade.flash.flashSwap(
            trade.loanPool.factory.address,
            trade.recipient.router.address,
            trade.tokenIn.id,
            trade.tokenOut.id,
            trade.recipient.tradeSize,
            trade.recipient.amountOut,
            trade.amountRepay,
            {
                type: 2,
                // gasPrice: gasLimit,
                maxFeePerGas: gasData.maxFee,
                maxPriorityFeePerGas: gasData.maxPriorityFee,
                gasLimit: gasData.gasEstimate,
                // nonce: nonce,
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
            address: trade.flash.address,
            topics: [
                utils.id("log(string,uint256)"),
                utils.id("logValue(string,uint256)"),
                utils.id("logAddress(string,address)"),
            ],
            fromBlock: "latest",
            toBlock: "pending"
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
        const bal = await checkBal(trade.tokenIn.id, trade.tokenIn.decimals, trade.tokenOut.id, trade.tokenOut.decimals)
        console.log("New wallet balance: ")
        console.log(bal)
        console.log("Transaction Sent. Await Confirmation...")
        console.log("Transaction Hash: " + txResponse.hash)
        result = {
            txResponse: txResponse,
            tradePending: false,
        }
        if (txResponse == undefined) {
            logger.info("Transaction response: ")
            logger.info(txResponse)
            logger.info("===============================================================")
            return result;
        }
        console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")
        return result;
    } else {
        console.log("::::::::::::::::::::::::::::::::::::::::TRADE UNDEFINED::::::::::::::::::::::::::::::::::::::: ")
        console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")
        return result;
    }
}

