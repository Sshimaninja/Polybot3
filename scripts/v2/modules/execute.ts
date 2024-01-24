import { ethers, Contract, Wallet, Transaction } from 'ethers'
import { provider, signer, logger } from '../../../constants/environment'
import {
    BoolTrade,
    Profit,
    TxData,
    V2Params,
    V2Tx,
    TxGas,
} from '../../../constants/interfaces'
import { checkBal, checkGasBal } from './checkBal'
import { logEmits } from './emits'
import { send } from './send'
import { notify } from './notify'
import { fetchGasPrice } from './fetchGasPrice'
import { pendingTransactions } from './pendingTransactions'
import { fu } from '../../modules/convertBN'

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
    profit: Profit
): Promise<TxData> {
    if (pendingTransactions[trade.ID]) {
        logger.info(
            '::::::::::::::::::::::::' +
                trade.ticker +
                trade.ID +
                ': PENDING TRANSACTION::::::::::::::::::::::::: '
        )
        return {
            txResponse: undefined,
            pendingID: await trade.target.pool.getAddress(),
        }
    } else {
        logger.info(
            '::::::::::::::::::::::::::::::::::::::::BEGIN TRANSACTION: ' +
                trade.ticker +
                '::::::::::::::::::::::::::'
        )

        var gasbalance = await checkGasBal()

        logger.info(
            'Wallet Balance Matic: ' + fu(gasbalance, 18) + ' ' + 'MATIC'
        )

        if (trade) {
            logger.info(
                'Wallet Balance Matic: ' + fu(gasbalance, 18) + ' ' + 'MATIC'
            )
            logger.info(
                'Gas Cost::::::::::::: ' +
                    fu(profit.gas.gasPrice, 18) +
                    ' ' +
                    "MATIC (if this is tiny, it's probably because gasEstimate has failed."
            )

            const gotGas = profit.gasCost < gasbalance

            gotGas == true
                ? logger.info('Sufficient Matic Balance. Proceeding...')
                : console.log('>>>>Insufficient Matic Balance<<<<')

            if (gotGas == false) {
                logger.info(
                    ':::::::::::::::::::::::END TRANSACTION: ' +
                        trade.ticker +
                        ': GAS GREATER THAN PROFIT::::::::::::::::::::::::: '
                )
                return {
                    txResponse: undefined,
                    pendingID: null,
                }
            }

            if (gotGas == true) {
                //re-fetch gas price. Might be unnecessary but it's free.
                let gasEstimate = await fetchGasPrice(trade)
                let gasObj: TxGas = {
                    type: 2,
                    gasPrice: profit.gas.gasPrice,
                    maxFeePerGas: Number(profit.gas.maxFee * 2n),
                    maxPriorityFeePerGas: Number(
                        profit.gas.maxPriorityFee * 2n
                    ),
                    gasLimit: gasEstimate.gasEstimate * 10n,
                }

                // Set the pending transaction flag for this pool
                pendingTransactions[trade.ID] = true

                logger.info(
                    ':::::::::::Sending Transaction: ' +
                        trade.loanPool.exchange +
                        ' to ' +
                        trade.target.exchange +
                        ' for ' +
                        trade.ticker +
                        ' : profit: ' +
                        profit.profit +
                        ':::::::::: '
                )

                await notify(trade, profit)

                const req = await send(trade, gasObj)

                const logs = await logEmits(trade, req)

                logger.info(
                    ':::::::::::::::::::::::::::::::::::Transaction logs::::::::::::::::::::::::: '
                )
                logger.info(logs)

                //Print balances after trade
                await checkBal(
                    trade.tokenIn.id,
                    trade.tokenIn.decimals,
                    trade.tokenOut.id,
                    trade.tokenOut.decimals
                )

                let result: TxData = {
                    txResponse: req.txResponse,
                    pendingID: null,
                }

                logger.info(
                    '::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::'
                )

                // Clear the pending transaction flag for this pool
                pendingTransactions[await trade.target.pool.getAddress()] =
                    false

                return result
            } else {
                logger.info(
                    '::::::::::::::::::::::::::::::::::::::::TRADE UNDEFINED::::::::::::::::::::::::::::::::::::::: '
                )

                logger.info(
                    '::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::'
                )

                return {
                    txResponse: undefined,
                    pendingID: null,
                }
            }
        } else {
            logger.info(
                '::::::::::::::::::::::::::::::::::::::::END TRANSACTION::::::::::::::::::::::::::::::::::::::::'
            )
            return {
                txResponse: undefined,
                pendingID: null,
            }
        }
    }
}
