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
	const f = utils.formatUnits;
	// Commented out for now to elimiate from testing & debugging:
	const maxFeeGasData = 150//gasData.fast.maxFee;
	const maxPriorityFeeGasData = 60//gasData.fast.maxPriorityFee;
	const maxFeeString = (Math.trunc(maxFeeGasData * 10 ** 9)).toString();
	const maxPriorityFeeString = (Math.trunc(maxPriorityFeeGasData * 10 ** 9)).toString();
	const maxFee = utils.parseUnits(utils.formatUnits(maxFeeString, 18), 18);
	const maxPriorityFee = utils.parseUnits(utils.formatUnits(maxPriorityFeeString, 18), 18);
	if (trade.direction != undefined) {
		console.log('EstimatingGas for trade: ' + trade.ticker + '...');
		let gasEstimate: BigNumber;
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
			console.log(`Error in fetchGasPrice for trade: ${trade.ticker} `, ". Using default gas estimate for gasPrice calcs");
			gasEstimate = BigNumber.from(300000);
		}
		// Helpful for figuring out how to determine and display gas prices:
		const gasLogs = {
			gasEstimate: gasEstimate.toString(),
			gasPrice: f(maxFee.add(maxPriorityFee), 18),
			maxFee: f(maxFee.toString(), 18),
			maxPriorityFee: f(maxPriorityFee.toString(), 18),
			gasLimit: f(gasEstimate.toString(), 18),
			gasEstimateTimesMaxFee: f(gasEstimate.mul(maxFee).toString()),
			gasEstimateTimesMaxPriorityFee: f(gasEstimate.mul(maxPriorityFee).toString(), 18),
			gasEstimateTimeesMaxFeePlusMaxPriorityFee: f(gasEstimate.mul(maxFee.add(maxPriorityFee)).toString(), 18)
		}
		console.log(gasLogs);
		const gasPrice = gasEstimate.mul(maxFee.add(maxPriorityFee));
		return { gasEstimate, gasPrice, maxFee: maxFee, maxPriorityFee: maxPriorityFee }
	} else {
		console.log(`>>>>>>>>>>>>>>>>>>>>> (fetchGasPrice) Trade direction undefined: ${trade.ticker} `, ` <<<<<<<<<<<<<<<<<<<<<<<<<< `);
		return { gasEstimate: BigNumber.from(300000), gasPrice: BigNumber.from(150 + 60 * 300000), maxFee: maxFee, maxPriorityFee: maxPriorityFee };
	}
}