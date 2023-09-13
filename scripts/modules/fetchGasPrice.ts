import { BigNumber, utils } from "ethers";
import { provider } from "../../constants/contract";
import { BoolTrade, GasData } from "../../constants/interfaces";

export async function fetchGasPrice(trade: BoolTrade): Promise<{ gasEstimate: BigNumber, gasPrice: BigNumber, maxFee: number, maxPriorityFee: number }> {
    if (trade.direction != undefined) {
        const gasData: GasData = trade.gasData;
        const maxFeeInGWEI = gasData.fast.maxFee;
        const maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee;
        const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9);
        const maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9);
        // const estimatedBaseFee = Math.trunc(gasData.estimatedBaseFee * 10 ** 9);
        // const lastestgasLimit = await provider.getBlock("latest");
        console.log('EstimatingGas for trade: ' + trade.ticker + '...');
        let gasEstimate;
        // if (trade.profit.gt(0)) {
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
        } catch (error: any) {
            console.log(`Error in fetchGasPrice for trade: ${trade.ticker}`, ". Using default gas estimate for gasPrice calcs");
            gasEstimate = BigNumber.from(300000);
        }
        const gasPrice = BigNumber.from(maxFee)
            .add(BigNumber.from(maxPriorityFee))
            .mul(gasEstimate.toNumber());
        return { gasEstimate, gasPrice, maxFee, maxPriorityFee }
    } else {
        console.log(`(fetchGasPrice) Trade direction undefined: ${trade.ticker}`, ". Using default gas estimate");
        return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(150 + 60 * 300000), maxFee: 150, maxPriorityFee: 60 };
    }


}
