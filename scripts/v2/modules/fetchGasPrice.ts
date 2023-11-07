import { BigNumber, utils } from "ethers";
import { provider } from "../../../constants/contract";
import { BoolTrade, GAS, GasData } from "../../../constants/interfaces";
import { logger } from "../../../constants/contract";
import { fu, pu } from "../../modules/convertBN";

/**
 * @param trade 
 * @returns gas estimate and gas price for a given trade.
 * If the gasEstimate fails, it will return a default gas estimate of 300000.
 * @returns gasData: { gasEstimate: BigNumber, gasPrice: BigNumber, maxFee: number, maxPriorityFee: number }
 */
export async function fetchGasPrice(trade: BoolTrade): Promise<GAS> {
	// Commented out for now to elimiate from testing & debugging:
	const maxFeeGasData = trade.gasData.fast.maxFee;//150 is placeholder until gasData works.
	// console.log('maxFeeGasData: ', maxFeeGasData)
	const maxPriorityFeeGasData = trade.gasData.fast.maxPriorityFee;//60 is placeholder until gasData works.
	// console.log('maxPriorityFeeGasData: ', maxPriorityFeeGasData)
	const maxFeeString = (Math.trunc(maxFeeGasData * 10 ** 9)).toString();
	// console.log('maxFeeString: ', maxFeeString)
	const maxPriorityFeeString = (Math.trunc(maxPriorityFeeGasData * 10 ** 9)).toString();
	// console.log('maxPriorityFeeString: ', maxPriorityFeeString)
	const maxFee = utils.parseUnits(utils.formatUnits(maxFeeString, 18), 18);
	// console.log('maxFee: ', maxFee)
	const maxPriorityFee = utils.parseUnits(utils.formatUnits(maxPriorityFeeString, 18), 18);
	// console.log('maxPriorityFee: ', maxPriorityFee)

	if (trade.direction != undefined) {
		console.log('EstimatingGas for trade: ' + trade.ticker + '...');
		let gasEstimate: BigNumber;
		try {
			gasEstimate = await trade.flash.estimateGas.flashSwap(
				trade.loanPool.factory.address,
				trade.loanPool.router.address,
				trade.target.router.address,
				trade.tokenIn.id,
				trade.tokenOut.id,
				trade.target.tradeSize,
				trade.target.amountOut,
				trade.loanPool.amountRepay
			);
		} catch (error: any) {
			console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>Error in fetchGasPrice for trade: ${trade.ticker} <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
			gasEstimate = pu('300000', 18)
			logger.info(error.reason);
			return { gasEstimate, tested: false, gasPrice: BigNumber.from(150 + 60 * 300000), maxFee, maxPriorityFee };
		}
		// Helpful for figuring out how to determine and display gas prices:		
		const gasLogs = {
			gasEstimate: gasEstimate.toString(),
			gasPrice: fu(maxFee.add(maxPriorityFee), 18),
			maxFee: fu(maxFee.toString(), 18),
			maxPriorityFee: fu(maxPriorityFee.toString(), 18),
			gasLimit: fu(gasEstimate.toString(), 18),
			gasEstimateTimesMaxFee: fu(gasEstimate.mul(maxFee).toString()),
			gasEstimateTimesMaxPriorityFee: fu(gasEstimate.mul(maxPriorityFee).toString(), 18),
			gasEstimateTimesMaxFeePlusMaxPriorityFee: fu(gasEstimate.mul(maxFee.add(maxPriorityFee)).toString(), 18)
		}
		console.log(gasLogs);
		const gasPrice = gasEstimate.mul(maxFee.add(maxPriorityFee));
		return { gasEstimate, tested: true, gasPrice, maxFee: maxFee, maxPriorityFee: maxPriorityFee }
	} else {
		console.log(`>>>>>>>>>>>>>>>>>>>>> (fetchGasPrice) Trade direction undefined: ${trade.ticker} `, ` <<<<<<<<<<<<<<<<<<<<<<<<<< `);
		return { gasEstimate: BigNumber.from(300000), tested: false, gasPrice: BigNumber.from(150 + 60 * 300000), maxFee: maxFee, maxPriorityFee: maxPriorityFee };
	}
}