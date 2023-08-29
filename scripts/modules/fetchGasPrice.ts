import { BigNumber, ethers, utils, Contract, Wallet } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { getGasData } from "./getPolygonGasPrices";
import axios from "axios";
import { Trade } from "./populateTrade"
import { provider, flash, logger } from "../../constants/contract";
import { BoolTrade, GasData } from "../../constants/interfaces";

export async function fetchGasPrice(trade: BoolTrade): Promise<{ gasEstimate: BigNumber, gasPrice: BigNumber, maxFee: number, maxPriorityFee: number }> {
    if (trade) {
        try {
            const gasData: GasData = trade.gasData;
            const maxFeeInGWEI = gasData.fast.maxFee;
            const maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee;
            const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9);
            const maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9);
            const estimatedBaseFee = Math.trunc(gasData.estimatedBaseFee * 10 ** 9);
            const lastestgasLimit = await provider.getBlock("latest");
            console.log('EstimatingGas for trade: ' + trade.ticker + '...');

            let gasEstimate;
            try {
                gasEstimate = await flash.estimateGas.flashSwap(
                    trade.loanPool.factoryID,
                    trade.recipient.routerID,
                    trade.tokenIn.id,
                    trade.tokenOut.id,
                    trade.tradeSize,
                    trade.loanPool.amountOutjs,
                    trade.loanPool.amountRepayjs
                );
            } catch (error: any) {
                if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
                    // Handle unpredictable gas limit error
                    // console.log('Estimating gas limit failed. Using manual gas limit...');
                    gasEstimate = lastestgasLimit.gasLimit;
                } else {
                    // throw error; // Rethrow other errors
                    return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(300000), maxFee: 150, maxPriorityFee: 60 };
                }
            }

            // Retrieve the emitted logs
            console.log("Gas Estimate: " + gasEstimate.toString() + " gas")
            const filter = {
                address: flash.address, // Replace with the contract address
                fromBlock: 0,
                toBlock: 'latest',
            };
            const logs = await provider.getLogs(filter);
            logs.forEach(log => {
                const parsedLog = flash.interface.parseLog(log);
                console.log(parsedLog.args.message); // Print the log message
            });

            /* Convert the fetched GWEI gas price to WEI after converting ignore the decimal value
             * as the transaction payload only accepts whole number
             */
            const gasPrice = BigNumber.from(maxFee).add(BigNumber.from(maxPriorityFee)).mul(gasEstimate ? gasEstimate : "error in gasPrice calculation");
            return { gasEstimate, gasPrice, maxFee, maxPriorityFee };
        } catch (error) {
            console.log(`Error in fetchGasPrice for trade: ${trade.ticker}`);
            console.log(error);
            return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(300000), maxFee: 150, maxPriorityFee: 60 };
        }
    } else {
        logger.error(`Error in fetchGasPrice for trade: Trade object is undefined`);
        return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(300000), maxFee: 150, maxPriorityFee: 60 };
    }
}
