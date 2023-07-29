// import { ethers } from 'ethers';
// import { logger } from '../constants/contract';
// import { BoolFlash } from '../constants/interfaces';
// export class sendTx {
//     tradejs!: BoolFlash;
//     tradePending!: boolean;
//     nonce!: number;
// }
// let  fullSend = new sendTx(tradeJs: BoolFlash, tradePending: boolean, nonce: number){
//     try {
//         // return//DEBUG
//         await sendit(
//             // profitjs,
//             tradejs,
//             // gasMult,
//             tradePending,
//             nonce);
// if (tradePending) {
//     logger.info("Trade pending...")
//     tradePending = false;
// } else {
//     logger.info("Trade failed. Exiting...")
//     tradePending = false;
// }
//     } catch (error: any) {
//     if (error.code === "INSUFFICIENT_FUNDS") {
//         logger.info('Insufficient funds for gas * price + value')
//         tradePending = false;
//         return
//     }
//     if (error.code === 'TRANSACTION_UNDERPRICED') {
//         gasMult = gasMult++;
//         nonce++;
//         logger.info('Transaction underpriced. Retrying with increased maxFeePerGas...')
//         await sendit(
//             // profitjs,
//             tradejs,
//             // gasMult,
//             tradePending,
//             nonce)
//     } if (error.code === `EXCEEDS_BLOCK_GAS_LIMIT`) {
//         logger.error('Tx price exceeds block gas limit. Aborting...')
//         tradePending = false;
//     } if (!tradePending && error.code === 'NONCE_EXPIRED') {
//         logger.info('Nonce too low. Retrying with increased gas...')
//         // nonce++;
//         gasMult++;
//         await sendit(
//             // profitjs,
//             tradejs,
//             // gasMult,
//             tradePending,
//             nonce)
//         tradePending = true;
//     } if (tradePending && error.code === 'NONCE_EXPIRED') {
//         // nonce++
//         gasMult++
//         console.log('Nonce too low. Incrementing Gas Price.')
//         tradePending = false
//     } else {
//         logger.error(':::::::::Unhandled Error sending transaction:::::::::')
//         logger.error(error)
//     }
// }
// }
// }