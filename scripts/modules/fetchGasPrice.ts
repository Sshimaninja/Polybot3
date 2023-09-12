import { BigNumber } from "ethers";
import { provider } from "../../constants/contract";
import { BoolTrade, GasData } from "../../constants/interfaces";

export async function fetchGasPrice(trade: BoolTrade): Promise<{ gasEstimate: BigNumber, gasPrice: BigNumber, maxFee: number, maxPriorityFee: number }> {
    if (trade) {
        const gasData: GasData = trade.gasData;
        const maxFeeInGWEI = gasData.fast.maxFee;
        const maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee;
        const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9);
        const maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9);
        const estimatedBaseFee = Math.trunc(gasData.estimatedBaseFee * 10 ** 9);
        const lastestgasLimit = await provider.getBlock("latest");
        console.log('EstimatingGas for trade: ' + trade.ticker + '...');
        let gasEstimate;
        if (trade.profit.gt(0)) {
            try {
                gasEstimate = await trade.flash.estimateGas.flashSwap(
                    trade.loanPool.factory.address,
                    trade.recipient.router.address,
                    trade.tokenIn.id,
                    trade.tokenOut.id,
                    trade.recipient.tradeSize,
                    trade.recipient.amountOut,
                    trade.amountRepay
                );
            } catch (error) {
                console.log(`Error in fetchGasPrice for trade: ${trade.ticker}`, ".Using default gas estimate");
                console.log(error);
                return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(300000), maxFee: 150, maxPriorityFee: 60 };
            }
        } else {
            console.log("No profit trade. Using default gas estimate")
            // throw error; // Rethrow other errors
            return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(300000), maxFee: 150, maxPriorityFee: 60 };

        }

        // Retrieve the emitted logs
        console.log("Gas Estimate: " + gasEstimate + " gas")


        const filter = {
            address: trade.flash.address, // Replace with the contract address
            fromBlock: 0,
            toBlock: 'latest',
        };
        const logs = await provider.getLogs(filter);
        logs.forEach(log => {
            const parsedLog = trade.flash.interface.parseLog(log);
            console.log(parsedLog.args.message); // Print the log message
        });

        /* Convert the fetched GWEI gas price to WEI after converting ignore the decimal value
         * as the transaction payload only accepts whole number
         */

        return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(300000), maxFee: 150, maxPriorityFee: 60 };
    }
    console.log("Trade undefined - using default gas.")
    return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(300000), maxFee: 150, maxPriorityFee: 60 };

}
