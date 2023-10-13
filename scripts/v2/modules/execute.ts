import { BigNumber, ethers, utils, Contract, Wallet, Transaction, } from "ethers";
import { provider, signer, wallet, logger } from "../../../constants/contract";
import { BoolTrade, Profit, TxData, V2Params, V2Tx, TxGas } from "../../../constants/interfaces";
import { checkBal, checkGasBal } from "./checkBal";
import { logEmits } from "./emits";
import { send } from "./send";
import { notify } from "./notify";
import { fetchGasPrice } from "./fetchGasPrice";
import { pendingTransactions } from "./pendingTransactions";

/**
 * @param trade
 * @param gasCost
 * @returns
 * @description
 * This function sends the transaction to the blockchain.
 * It returns the transaction hash, and a boolean to indicate if the transaction is pending.
 * The transaction hash is used to check the status of the transaction.
 * The boolean is used to prevent multiple transactions from being sent.
 * If the transaction is pending, the function will return.
 * If the transaction is not pending, the function will send the transaction.
 * If the transaction is undefined, the function will return.
 */

// Keep track of pending transactions for each pool

export async function execute(
	trade: BoolTrade,
	profit: Profit,
): Promise<TxData> {
	if (pendingTransactions[trade.ID]) {
		console.log("::::::::::::::::::::::::" + trade.ticker + trade.ID + ': PENDING TRANSACTION::::::::::::::::::::::::: ')
		return {
			txResponse: undefined,
			pendingID: trade.recipient.pool.address,
		};
	} else {
		console.log('::::::::::::::::::::::::::::::::::::::::BEGIN TRANSACTION: ' + trade.ticker + '::::::::::::::::::::::::::')


		var gasbalance = await checkGasBal();

		console.log("Wallet Balance Matic: " + ethers.utils.formatUnits(gasbalance, 18) + " " + "MATIC")

		if (trade) {
			console.log("Wallet Balance Matic: " + ethers.utils.formatUnits(gasbalance, 18) + " " + "MATIC")
			console.log("Gas Cost::::::::::::: " + ethers.utils.formatUnits(profit.gas.gasPrice, 18) + " " + "MATIC")

			const gotGas = profit.gasCost.lt(gasbalance)

			gotGas == true ? console.log("Sufficient Matic Balance. Proceeding...") : console.log(">>>>Insufficient Matic Balance<<<<")

			if (gotGas == false) {
				console.log(":::::::::::::::::::::::END TRANSACTION: " + trade.ticker + ': GAS GREATER THAN PROFIT::::::::::::::::::::::::: ')
				return {
					txResponse: undefined,
					pendingID: null,
				};
			}

			if (gotGas == true) {

				let gasEstimate = await fetchGasPrice(trade);
				let gasObj: TxGas = {
					type: 2,
					maxFeePerGas: Number(profit.gas.maxFee),
					maxPriorityFeePerGas: Number(profit.gas.maxPriorityFee),
					gasLimit: gasEstimate.gasEstimate,
				}

				// Check if there is already a pending transaction for this pool


				// Set the pending transaction flag for this pool
				pendingTransactions[trade.ID] = true;

				console.log(":::::::::::Sending Transaction: " + trade.loanPool.exchange + " to " + trade.recipient.exchange + " for " + trade.ticker + " : profit: " + profit.profit + ":::::::::: ")

				await notify(trade, profit);

				const req = await send(trade, gasObj);

				const logs = await logEmits(trade, req);

				logger.info("Transaction logs: \n" + logs)

				//Print balances after trade
				await checkBal(trade.tokenIn.id, trade.tokenIn.decimals, trade.tokenOut.id, trade.tokenOut.decimals)

				let result: TxData = {
					txResponse: req.txResponse,
					pendingID: null,
				}

				console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")

				// Clear the pending transaction flag for this pool
				pendingTransactions[trade.recipient.pool.address] = false;

				return result;

			} else {

				console.log("::::::::::::::::::::::::::::::::::::::::TRADE UNDEFINED::::::::::::::::::::::::::::::::::::::: ")

				console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")

				return {
					txResponse: undefined,
					pendingID: null,
				};
			}
		} else {
			console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")
			return {
				txResponse: undefined,
				pendingID: null,
			};
		}
	}
}