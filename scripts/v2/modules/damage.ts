import { BoolTrade } from "../../../constants/interfaces";
import { utils as u } from "ethers";
import { gasVprofit } from "./gasVprofit";
import { sendit } from "../execute";
import { BigNumber as BN } from "bignumber.js";
import { logger } from "../../../constants/contract";
/**
 * Executes profitable trades
 * @param trade 
 * @param data 
 * @param warning 
 * @param tradePending 
 * @param pendingID 
 * @returns 
 */
export async function rollDamage(trade: BoolTrade, data: any, warning: number, tradePending: boolean, pendingID: string | undefined) {

	// Conversion to BN because BN works with decimals
	const profpercBN = BN(u.formatUnits(trade.profitPercent, trade.tokenOut.decimals))

	if (profpercBN.gt(0.6) || profpercBN.lt(-0.6)) {

		logger.info(data)

		const actualProfit = await gasVprofit(trade)

		if (BN(actualProfit.profit).gt(0) && warning === 0) {
			logger.info("Profitable trade found on " + trade.ticker + "!")
			logger.info("Profit: ", actualProfit.profit.toString(), "Gas Cost: ", actualProfit.gasCost.toString(), "Flash Type: ", trade.type)
			tradePending = true
			pendingID = trade.recipient.pool.address

			await sendit(trade, actualProfit)

			warning++
			return warning
		}

		if (BN(actualProfit.profit).gt(0) && warning === 1) {
			logger.info("Trade pending on " + pendingID + "?: ", tradePending)
			warning++
			return warning
		}

		if (BN(actualProfit.profit).gt(0) && warning > 1) {
			return
		}

		if (BN(actualProfit.profit).lte(0)) {
			console.log("<<<<<<<<<<<<No Trade: " + trade.ticker + " [ gas > profit ] >>>>>>>>>>>>")
			console.log(data)
			return
		}

		if (actualProfit.profit == undefined) {
			console.log("Profit is undefined: error in gasVProfit")
			return
		}

	} else if (profpercBN.lt(0.6) && profpercBN.gt(-0.6)) {
		console.log("<<<<<<<<<<<<No Trade: " + trade.ticker + " [ profit < 0.6% ] >>>>>>>>>>>>")
		// console.log(data.basicData)
		return
	}
}