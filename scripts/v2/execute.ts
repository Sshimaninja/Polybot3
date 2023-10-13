import { BigNumber, ethers, utils, Contract, Wallet, Transaction, } from "ethers";
import { provider, signer, wallet, logger } from "../../constants/contract";
import { BoolTrade, Profit, TxData, V2Params, V2Tx, TxGas } from "../../constants/interfaces";
import { checkBal, checkGasBal } from "./modules/checkBal";
import { logEmits } from "./modules/emits";
import { send } from "./modules/send";
import { notify } from "./modules/notify";
import { fetchGasPrice } from "./modules/fetchGasPrice";


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
export async function execute(
	trade: BoolTrade,
	profit: Profit,
): Promise<TxData> {
	console.log('::::::::::::::::::::::::::::::::::::::::BEGIN TRANSACTION: ' + trade.ticker + '::::::::::::::::::::::::::')

	var gasbalance = await checkGasBal();

	console.log("Wallet Balance Matic: " + ethers.utils.formatUnits(gasbalance, 18) + " " + "MATIC")

	let result: TxData = {
		txResponse: undefined,
		tradePending: false,
	}

	if (trade) {
		console.log("Wallet Balance Matic: " + ethers.utils.formatUnits(gasbalance, 18) + " " + "MATIC")
		console.log("Gas Cost::::::::::::: " + ethers.utils.formatUnits(profit.gas.gasPrice, 18) + " " + "MATIC")

		const gotGas = profit.gasCost.lt(gasbalance)

		gotGas == true ? console.log("Sufficient Matic Balance. Proceeding...") : console.log(">>>>Insufficient Matic Balance<<<<")

		if (gotGas == false) {
			console.log(":::::::::::::::::::::::END TRANSACTION: " + trade.ticker + ': GAS GREATER THAN PROFIT::::::::::::::::::::::::: ')
			return result;
		}

		if (gotGas == true) {

			let gasEstimate = await fetchGasPrice(trade);
			let gasObj: TxGas = {
				type: 2,
				// gasPrice: gasLimit,
				maxFeePerGas: trade.gasData.fast.maxFee * 2,
				maxPriorityFeePerGas: trade.gasData.fast.maxPriorityFee * 2,
				gasLimit: gasEstimate.gasEstimate,
				// nonce: nonce,
			}
			//Notify of possible trade (after testing move to post-profitable trade)
			// await notify(trade, profit);

			console.log(":::::::::::Sending Transaction::::::::::: ")

			result.tradePending = true;

			const tel = await notify(trade, profit);

			const req = await send(trade, gasObj);

			const logs = await logEmits(trade, req);

			logger.info("Transaction logs: \n" + logs)

			//Print balances after trade
			await checkBal(trade.tokenIn.id, trade.tokenIn.decimals, trade.tokenOut.id, trade.tokenOut.decimals)

			result = {
				txResponse: req.txResponse,
				tradePending: false,
			}

			console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")

			return result;

		} else {

			console.log("::::::::::::::::::::::::::::::::::::::::TRADE UNDEFINED::::::::::::::::::::::::::::::::::::::: ")

			console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")

			return result;
		}
	} else {
		console.log("::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::")
		return result;
	}
}