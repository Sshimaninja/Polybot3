import { wallet, provider } from "../../../constants/contract";
import { BoolTrade, TxData, V2Tx, TxGas } from "../../../constants/interfaces";
import { BigNumber } from "ethers";
import { sendTx } from "./sendTx"

export async function send(trade: BoolTrade, gasObj: TxGas): Promise<TxData> {
	let tx: V2Tx = await trade.flash.flashSwap(
		trade.loanPool.factory.address,
		trade.loanPool.router.address,
		trade.target.router.address,
		trade.tokenIn.id,
		trade.tokenOut.id,
		trade.target.tradeSize,
		trade.target.amountOut,
		trade.loanPool.amountRepay,
		gasObj
	);
	try {
		const t = await sendTx(tx)
		if (t !== undefined) {
			await t.wait(30);
			return {
				txResponse: t,
				pendingID: trade.ID,
			}
		} else {
			return {
				txResponse: t,
				pendingID: null,
			}
		}
	} catch (error: any) {
		// if (error.message.includes("transaction underpriced")) {
		// 	console.log("[send.ts]: TRANSACTION UNDERPRICED " + error.message)
		// 	gasObj = {
		// 		type: 2,
		// 		maxFeePerGas: gasObj.maxFeePerGas + 10,
		// 		maxPriorityFeePerGas: gasObj.maxPriorityFeePerGas + 10,
		// 		gasLimit: gasObj.gasLimit.add(BigNumber.from(10000)),
		// 	}
		// 	const newTx = await sendTx(tx)
		// 	console.log("Retrying transaction with new gas price: " + gasObj.maxFeePerGas)
		// 	// Wait for the new transaction to be confirmed
		// 	if (newTx !== undefined) {
		// 		await newTx.wait(30);
		// 		return {
		// 			txResponse: newTx,
		// 			pendingID: trade.ID,
		// 		}
		// } else {
		console.log("[send.ts]:Transaction send(tx) failed. Error: " + error.message)
		// return {
		// 	txResponse: newTx,
		// 	pendingID: null,
		// }
	}
	// }
	return {
		txResponse: undefined,
		pendingID: null,
	}
}

