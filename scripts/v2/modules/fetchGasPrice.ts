import { BigNumber, utils } from "ethers";
import { provider } from "../../../constants/contract";
import { BoolTrade, GAS, GasData } from "../../../constants/interfaces";
import { tradeLogs } from "./tradeLog";
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

	// Calculate the function selector
	const swapFunctionSignature = 'swap(uint256,uint256,address,bytes)';
	const swapFunctionSelector = utils.id(swapFunctionSignature).substring(0, 10);

	// Get the contract ABI
	const loanContractABI = trade.loanPool.pool.interface.functions
	const targetContactABI = trade.target.pool.interface.functions


	const loanContractAddress = trade.loanPool.pool.address;
	const targetContractAddress = trade.target.pool.address;
	console.log('loanContractABI Length: ', loanContractABI.length)
	console.log('loanContractID: ', loanContractAddress)
	console.log('targetContractABI: ', targetContactABI.length)
	console.log('targetContractID: ', targetContractAddress)
	// Check if the swap function exists in the contract ABI
	// const swapFunctionExists = pairContractABI.some(
	// 	(func) => ethers.utils.id(func.name + '(' + func.inputs.map(i => i.type).join(',') + ')').substring(0, 10) === swapFunctionSelector
	// );

	// console.log('Swap function exists:', swapFunctionExists);



	if (trade.direction != undefined) {
		console.log('EstimatingGas for trade: ' + trade.ticker + '...');
		let gasEstimate: BigNumber;
		try {
			//'override' error possibly too many args sent to contract? Or somethind to do with estimateGas not being able to properly create BigNumbers object.
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
			const data = await tradeLogs(trade);
			logger.error(`>>>>>>>>>>>>>>>>>>>>>>>>>>Error in fetchGasPrice for trade: ${trade.ticker} <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
			logger.error(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>TRADE DATA: ${trade.ticker} <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
			logger.error(data)
			logger.error(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>END TRADE DATA: ${trade.ticker} <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
			logger.error(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>ERROR DATA: ${trade.ticker} <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
			logger.error(error);
			logger.trace("TRACE:");
			logger.trace(error);
			console.trace("CONSOLE TRACE:");
			logger.error(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>END ERROR DATA: ${trade.ticker} <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
			logger.error(`>>>>>>>>>>>>>>>>>>>>>>>>>>Error in fetchGasPrice for trade: ${trade.ticker} <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
			gasEstimate = pu('300000', 18)
			logger.info(error.reason);
			return { gasEstimate, tested: false, gasPrice: BigNumber.from(150 + 60 * 300000), maxFee, maxPriorityFee };
		}
		// Helpful for figuring out how to determine and display gas prices:		
		const gasLogs = {
			gasEstimate: gasEstimate.toString(),
			gasPrice: fu(maxFee.add(maxPriorityFee).mul(BigNumber.from(10)), 18),
			maxFee: fu(maxFee.toString(), 18),
			maxPriorityFee: fu(maxPriorityFee.toString(), 18),
			gasLimit: fu(gasEstimate.toString(), 18),
			gasEstimateTimesMaxFee: fu(gasEstimate.mul(maxFee).toString()),
			gasEstimateTimesMaxPriorityFee: fu(gasEstimate.mul(maxPriorityFee).toString(), 18),
			gasEstimateTimesMaxFeePlusMaxPriorityFee: fu(gasEstimate.mul(maxFee.add(maxPriorityFee)).toString(), 18),
			gasEstimateTimesMaxFeePlusMaxPriorityFeeTimes10: fu((gasEstimate.mul(maxFee.add(maxPriorityFee)).add(maxFee)).mul(BigNumber.from(10)).toString(), 18)
		}
		console.log(gasLogs);
		const gasPrice = (gasEstimate.mul(maxFee.add(maxPriorityFee)).add(maxFee)).mul(BigNumber.from(10));
		console.log(gasLogs);
		console.log(fu(gasPrice, 18))
		return { gasEstimate, tested: true, gasPrice, maxFee: maxFee, maxPriorityFee: maxPriorityFee }
	} else {
		console.log(`>>>>>>>>>>>>>>>>>>>>> (fetchGasPrice) Trade direction undefined: ${trade.ticker} `, ` <<<<<<<<<<<<<<<<<<<<<<<<<< `);
		return { gasEstimate: BigNumber.from(300000), tested: false, gasPrice: BigNumber.from(150 + 60 * 300000), maxFee: maxFee, maxPriorityFee: maxPriorityFee };
	}
}