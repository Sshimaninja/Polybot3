import { BoolTrade } from "../../../constants/interfaces";
import { utils as u, BigNumber } from "ethers";
import { gasVprofit } from "./gasVprofit";
import { execute } from "./execute";
import { BigNumber as BN } from "bignumber.js";
import { logger } from "../../../constants/contract";
/**
 * Executes profitable trades
 * @param trade 
 * @param data 
 * @param warning 
 * @param  
 * @param pendingID 
 * @returns 
 */
export async function rollDamage(trade: BoolTrade, data: any, warning: number) {

	// Conversion to BN because BN works with decimals
	const profpercBN = BN(u.formatUnits(trade.profitPercent, trade.tokenOut.decimals))

	if (profpercBN.gt(BN(0)) && trade.loanPool.reserveInBN.gt(BN(1)) && trade.loanPool.reserveOutBN.gt(BN(1)) && trade.recipient.reserveInBN.gt(BN(1)) && trade.recipient.reserveOutBN.gt(BN(1)) /* || profpercBN.lt(0)*/) { // May need to take fees into account here, but testing now.

		// logger.info(await data)// 

		const actualProfit = await gasVprofit(trade)

		if (BN(actualProfit.profit).gt(0) && warning === 0) {
			logger.info("Profitable trade found on " + trade.ticker + "!")
			logger.info("Profit: ", actualProfit.profit.toString(), "Gas Cost: ", u.formatUnits(actualProfit.gas.gasPrice, 18), "Flash Type: ", trade.type)
			await execute(trade, actualProfit)
			return
		}

		if (BN(actualProfit.profit).gt(0) && warning === 1) {
			logger.info(">>>>>>>>>>>Trade pending on " + trade.loanPool.exchange + trade.recipient.exchange + " for " + trade.ticker + "<<<<<<<<<<<<")
			return
		}

		if (BN(actualProfit.profit).gt(0) && warning > 1) {
			return
		}

		if (BN(actualProfit.profit).lte(0)) {
			console.log("<<<<<<<<<<<<No Trade After gasVprofit: " + trade.ticker + " [ gas > profit ] >>>>>>>>>>>>")
			console.log(data)
			return
		}

		if (actualProfit.profit == undefined) {
			console.log("Profit is undefined: error in gasVProfit")
			return
		}

	} else if (profpercBN.lt(0) /*&& profpercBN.gt(-0.6)*/) { // TESTING
		console.log("<<<<<<<<<<<<No Trade: " + trade.ticker + " [ profit < 0.3% | " + profpercBN.toFixed(trade.tokenOut.decimals) + " ] >>>>>>>>>>>>")
		// console.log(await data)
		// console.log(data.basicData)
		return
	}
}