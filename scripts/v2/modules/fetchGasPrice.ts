import { BigNumber, utils } from "ethers";
import { provider } from "../../../constants/contract";
import { BoolTrade, GAS, GasData } from "../../../constants/interfaces";
/**
 * @param trade 
 * @returns gas estimate and gas price for a given trade.
 * If the gasEstimate fails, it will return a default gas estimate of 300000.
 * @returns gasData: { gasEstimate: BigNumber, gasPrice: BigNumber, maxFee: number, maxPriorityFee: number }
 */
export async function fetchGasPrice(trade: BoolTrade): Promise<GAS> {
	const gasData: GasData = trade.gasData;
	const maxFeeInGWEI = gasData.fast.maxFee;
	const maxPriorityFeeInGWEI = gasData.fast.maxPriorityFee;
	const maxFee = Math.trunc(maxFeeInGWEI * 10 ** 9);
	const maxPriorityFee = Math.trunc(maxPriorityFeeInGWEI * 10 ** 9);
	if (trade.direction != undefined) {

		// const estimatedBaseFee = Math.trunc(gasData.estimatedBaseFee * 10 ** 9);
		// const lastestgasLimit = await provider.getBlock("latest");
		console.log('EstimatingGas for trade: ' + trade.ticker + '...');
		let gasEstimate;
		try {
			gasEstimate = await trade.flash.estimateGas.flashSwap(
				trade.loanPool.factory.address,
				trade.recipient.router.address,
				trade.tokenIn.id,
				trade.tokenOut.id,
				trade.recipient.tradeSize,
				trade.recipient.amountOut,
				trade.loanPool.amountRepay
			);
		} catch (error: any) {
			console.log(`Error in fetchGasPrice for trade: ${trade.ticker}`, ". Using default gas estimate for gasPrice calcs");
			gasEstimate = BigNumber.from(300000 * 10 ** 9);
		}
		console.log(
			"fetchGasPrice: gasEstimate: ", utils.formatUnits(gasEstimate, 18),
			"gasPrice: ", maxFee + maxPriorityFee,
			"maxFee: ", maxFee,
			"maxPriorityFee: ", maxPriorityFee,
			"gasLimit: ", gasEstimate.toNumber(),
			"gasEstimate * maxFee: ", gasEstimate.toNumber() * maxFee,
			"gasEstimate * maxPriorityFee: ", gasEstimate.toNumber() * maxPriorityFee);
		const gasPrice = BigNumber.from(maxFee)
			.add(BigNumber.from(maxPriorityFee))
			.mul(gasEstimate.toNumber());
		return { gasEstimate, gasPrice, maxFee, maxPriorityFee }
	} else {
		console.log(`>>>>>>>>>>>>>>>>>>>>>(fetchGasPrice) Trade direction undefined: ${trade.ticker}`, `<<<<<<<<<<<<<<<<<<<<<<<<<<`);
		return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(150 + 60 * 300000), maxFee: maxFee, maxPriorityFee: maxPriorityFee };
	}


}
