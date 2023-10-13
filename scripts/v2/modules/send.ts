import { wallet, provider } from "../../../constants/contract";
import { BoolTrade, TxData, V2Tx, TxGas } from "../../../constants/interfaces";
import { BigNumber } from "ethers";
import { sendTx } from "./sendTx"

export async function send(trade: BoolTrade, gasObj: TxGas): Promise<TxData> {

	let tx: V2Tx = await trade.flash.flashSwap(
		trade.loanPool.factory.address,
		trade.loanPool.router.address,
		trade.recipient.router.address,
		trade.tokenIn.id,
		trade.tokenOut.id,
		trade.recipient.tradeSize,
		trade.recipient.amountOut,
		trade.loanPool.amountRepay,
		gasObj
	);

	try {

		const t = await sendTx(tx)
		await t.wait(30);

	} catch (error: any) {

		if (error.message.includes("transaction underpriced")) {
			console.log("[send.ts]: TRANSACTION UNDERPRICED " + error.message)

			gasObj = {
				type: 2,
				maxFeePerGas: gasObj.maxFeePerGas + 10,
				maxPriorityFeePerGas: gasObj.maxPriorityFeePerGas + 10,
				gasLimit: gasObj.gasLimit.add(BigNumber.from(10000)),
			}

			const newTx = await sendTx(tx)

			console.log("Retrying transaction with new gas price: " + gasObj.maxFeePerGas)

			// Wait for the new transaction to be confirmed
			await newTx.wait(30);

			return {
				txResponse: newTx,
				pendingID: trade.ID,
			}
		} else {
			console.log("[send.ts]:Transaction send(tx) failed. Error: " + error.message)
			return {
				txResponse: "error",
				pendingID: null,
			}
		}
	}
	return {
		txResponse: "error",
		pendingID: null,
	}
}



// if (txResponse.maxPriorityFeePerGas?.gt(gasObj.maxPriorityFeePerGas)) {
//     gasObj.maxFeePerGas = gasObj.maxFeePerGas
//     gasObj.maxPriorityFeePerGas = gasObj.maxPriorityFeePerGas
//     console.log("Retrying transaction with new gas price: " + gasObj.maxFeePerGas)
//     tx = await trade.flash.flashSwap(
//         flashParams,
//         gasObj)
//     signedTx = await wallet.signTransaction(tx);
//     txResponse = await provider.sendTransaction(signedTx);
//     await txResponse.wait(1);
//     return {
//         txResponse: txResponse,
//         tradePending: true,
//     }
// }