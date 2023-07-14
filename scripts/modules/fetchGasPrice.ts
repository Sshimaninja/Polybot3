import { BigNumber, ethers, utils, Contract, Wallet } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import axios from "axios";
import { boolFlash } from "../../constants/interfaces";
import { provider, flash, logger } from "../../constants/contract";

export async function fetchGasPrice(
    trade: boolFlash
): Promise<{ gasEstimate: BigNumber, gasPrice: BigNumber, maxFee: number, maxPriorityFee: number }> {
    try {
        const gasData: any = (await axios.get("https://gasstation.polygon.technology/v2")).data;
        // Get the maxFee and maxPriorityFee for fast
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
                trade.tokenInID,
                trade.tokenOutID,
                trade.amountIn,
                trade.loanPool.amountOut,
                trade.loanPool.amountRepay
            );
        } catch (error: any) {
            if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
                // Handle unpredictable gas limit error
                // console.log('Estimating gas limit failed. Using manual gas limit...');
                gasEstimate = lastestgasLimit.gasLimit;
            } else {
                throw error; // Rethrow other errors
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

        // process.exit(1);
    }
}
