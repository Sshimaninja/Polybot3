import { wallet, provider } from "../../constants/contract";
import { TxData, V2Tx, TxGas } from "../../constants/interfaces";
import { BoolTrade, V2Params } from "../../constants/interfaces";

export async function send(trade: BoolTrade, flashParams: V2Params, tx: V2Tx, gasObj: TxGas,): Promise<TxData> {

    async function send(tx: any, gasObj: any): Promise<TxData> {
        let signedTx = await wallet.signTransaction(tx);
        let txResponse = await provider.sendTransaction(signedTx);
        await txResponse.wait(1);
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

        const t = await send(tx, gasObj)
        return t

    } catch (error: any) {
        if (error.message.includes("transaction underpriced")) {
            console.log("Error TRANSACTION UNDERPRICED in execute.ts " + error.message)
            gasObj = {
                type: 2,
                maxFeePerGas: gasObj.maxFeePerGas + 2,
                maxPriorityFeePerGas: gasObj.maxPriorityFeePerGas + 2,
                gasLimit: gasObj.gasLimit.add(100000),
            }
            tx = await trade.flash.flashSwap(
                flashParams,
                gasObj)
            await send(tx, gasObj)
            console.log("Retrying transaction with new gas price: " + gasObj.maxFeePerGas)
        } else {
            console.log("Transaction failed. Error: " + error.message)
            return {
                txResponse: "error",
                tradePending: false
            }
        }
    } return {
        txResponse: "error",
        tradePending: false
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