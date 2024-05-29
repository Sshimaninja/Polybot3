import {
	Bool3Trade
} from "../../../constants/interfaces";
import { Profit } from "../../../constants/interfaces";
import { gasTokens, uniswapV2Exchange } from "../../../constants/addresses";
import { fetchGasPrice } from "./transaction/fetchGasPrice";
import { WMATICFlashProfit } from "../classes/WMATICFlashProfit";
//import { WMATICSingleProfit } from "../classes/WMATICSingleProfit";
import { tradeLogs } from "./tradeLog";
import { fu } from "../../modules/convertBN";
import { logger } from "../../../constants/logger";
import { Console } from "console";
require("dotenv").config();
/**
 * Determines whether the profit is greater than the gas cost.
 * @param trade
 * @returns Profit{profit: string, gasEstimate: bigint, gasCost: bigint, gasPool: string}
 */
export async function trueProfit(trade: Bool3Trade): Promise<Bool3Trade> {
	if (trade.type.includes("flash")) {
		try {
			// Calculate profit & compare to gas cost
			let WMATICprofit = new WMATICFlashProfit(
				trade,
				gasTokens,
				uniswapV2Exchange,
			);
			let profitInWMATIC = await WMATICprofit.getWMATICProfit();
			trade.profits.WMATICProfit = profitInWMATIC;

			// let logs = await tradeLogs(trade);
			return trade;
		} catch (error: any) {
			logger.error("Error in trueProfit: ", error);
			return trade;
		}
	}
	//if (trade.type === "single") {
	//	try {
	//		// Calculate profit & compare to gas cost
	//		let WMATICprofit = new WMATICSingleProfit(
	//			trade,
	//			gasTokens,
	//			uniswapV2Exchange,
	//		);
	//		let profitInWMATIC = await WMATICprofit.getWMATICProfit();
	//		trade.profits.WMATICProfit = profitInWMATIC;

	//		// let logs = await tradeLogs(trade);
	//		return trade;
	//	} catch (error: any) {
	//		logger.error("Error in trueProfit: ", error);
	//		return trade;
	//	}
	//}
	return trade;
}
