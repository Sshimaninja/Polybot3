import { logger } from "../../../../constants/logger";
import {
	Bool3Trade,
	Profit,
	TxData,
	V2Params,
	V2Tx,
	TxGas,
} from "../../../../constants/interfaces";
import { walletBal, checkGasBal } from "../tools/walletBal";
//import { notify } from "./notify";
import { pendingTransactions } from "../../control";
import { fu } from "../../../modules/convertBN";
import { TransactionReceipt, Transaction } from "ethers";
import { Hash } from "crypto";
import { signer } from "../../../../constants/provider";
import { params } from "./params";
/**
 * @param trade
 * @param gasCost
 * @returns
 * @description
 */

export async function flash(
	trade: Bool3Trade,
): Promise<TransactionReceipt | null> {
	logger.info(
		"::::::::::::BEGIN TRANSACTION: ",
		trade.ticker,
		"::::::::::::",
	);

	var gasbalance = await checkGasBal();
	logger.info("Wallet Balance Matic: ", fu(gasbalance, 18), "MATIC");
	logger.info("Wallet Balance Matic: ", fu(gasbalance, 18), "MATIC");
	logger.info("Gas Cost::::::::::::", fu(trade.gas.gasPrice, 18));

	const gotGas = trade.gas.gasPrice < gasbalance;
	if (!gotGas) {
		console.log(">>>>Insufficient Matic Balance<<<<");
		return null;
	}
	// Set the pending transaction flag for this pool
	const oldBal = await walletBal(trade.tokenIn, trade.tokenOut);
	logger.info(
		":::::::::::Sending Transaction: " +
		trade.loanPool.exchange +
		" to " +
		trade.target.exchange +
		" for " +
		trade.ticker +
		" : profit: " +
		fu(trade.profits.WMATICProfit, 18) +
		":::::::::: ",
	);

	//await notify(trade);
	let p = {
		params: await params(trade),
	}
	let tx: Transaction = await trade.contract.initFlash(
		p.params.swap,
	);
	try {
		// const signedTx = await wallet.signTransaction(tx);
		const txResponse = await signer.sendTransaction(tx);
		const receipt = await txResponse.wait(30);
		pendingTransactions[await trade.target.pool.getAddress()] = false;
		if (!receipt) {
			logger.info("Transaction failed with txResponse: " + txResponse);
			return null;
		}
		logger.info("TRANSACTION COMPLETE: " + trade.ticker, receipt.hash);

		//Print balances after trade
		const newBal = await walletBal(trade.tokenIn, trade.tokenOut);
		logger.info(">>>>>>>>>>>Old Balance: ", oldBal);
		logger.info(">>>>>>>>>>>New Balance: ", newBal);
		logger.info(
			"::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::",
		);
		return receipt;
		// Clear the pending transaction flag for this pool
	} catch (error: any) {
		logger.info(`Transaction failed. Error: ${error.message}`);
	}
	return null;
}
