import { wallet, provider } from "../../../constants/contract";
import { BoolTrade, TxData, V2Tx, TxGas } from "../../../constants/interfaces";
import { BigNumber } from "ethers";

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

	async function send(tx: any): Promise<TxData> {
		let signedTx = await wallet.signTransaction(tx);
		let txResponse = await provider.sendTransaction(signedTx);
		await txResponse.wait(10);
		console.log("Tx sent. txHash: " + txResponse.hash + " Awaiting confirmation. Confirmations: " + txResponse.confirmations)
		if (txResponse.blockHash != null) {
			console.log("Transaction confirming. Block Hash: " + txResponse.blockHash)
			//Wait until tx is mined to return tradePending == false.
			await txResponse.wait(30);
			return {
				txResponse: txResponse,
				tradePending: false
			}
		} else {
			console.log("Transaction failed. Error: " + txResponse)
			return {
				txResponse: txResponse,
				tradePending: false
			}
		}
	}

	try {

		const t = await send(tx)
		return t

	} catch (error: any) {

		if (error.includes("transaction underpriced")) {
			console.log("Error TRANSACTION UNDERPRICED in execute.ts " + error.message)

			gasObj = {
				type: 2,
				maxFeePerGas: gasObj.maxFeePerGas + 10,
				maxPriorityFeePerGas: gasObj.maxPriorityFeePerGas + 10,
				gasLimit: gasObj.gasLimit.add(BigNumber.from(10000)),
			}

			const newTx = await send(tx)

			console.log("Retrying transaction with new gas price: " + gasObj.maxFeePerGas)

			// Wait for the new transaction to be confirmed
			await newTx.txResponse.wait(1);

			return {
				txResponse: newTx.txResponse,
				tradePending: false
			}
		} else {
			console.log("Transaction failed. Error: " + error.message)
			return {
				txResponse: "error",
				tradePending: false
			}
		}
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