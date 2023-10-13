import { ethers } from "ethers";
import { wallet, provider } from "../../../constants/contract";
import { TxData, V2Tx } from "../../../constants/interfaces";

export async function sendTx(tx: any): Promise<ethers.providers.TransactionResponse> {
	let signedTx = await wallet.signTransaction(tx);
	let txResponse = await provider.sendTransaction(signedTx);
	await txResponse.wait(10);
	console.log("Tx sent. txHash: " + txResponse.hash + " Awaiting confirmation. Confirmations: " + txResponse.confirmations)
	if (txResponse.blockHash != null) {
		console.log("Transaction confirming. Block Hash: " + txResponse.blockHash)
		await txResponse.wait(30);
		return txResponse
	} else {
		console.log("[sendTx.ts]: Transaction failed. Error: " + txResponse)
		return txResponse
	}
}