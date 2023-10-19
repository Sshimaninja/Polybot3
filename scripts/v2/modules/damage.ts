import { BoolTrade, PendingTx } from "../../../constants/interfaces";
import { utils as u, BigNumber } from "ethers";
import { gasVprofit } from "./gasVprofit";
import { execute } from "./execute";
import { BigNumber as BN } from "bignumber.js";
import { tradeLogs } from "./tradeLog";
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

var pendingTrades: PendingTx[] = []
console.log(pendingTrades)//debug

export async function rollDamage(trade: BoolTrade) {

	const profpercBN = BN(u.formatUnits(trade.profitPercent, trade.tokenOut.decimals))

	let newTx: PendingTx = {
		ID: trade.ID,
		warning: false
	}
	// Conversion to BN because BN works with decimals

	if (pendingTrades.includes(newTx)) {
		console.log("<<<<<<<<<<<<Trade Pending: " + trade.ticker + trade.loanPool.exchange + trade.target.exchange + " [ pending ] >>>>>>>>>>>>")
		newTx = {
			ID: trade.ID,
			warning: true
		}
		return
	}
	// If profit > 0, and all reserves > 1, find profit vs gas cost
	if (
		profpercBN.gt(BN(0)) && (trade.loanPool.reserveInBN && trade.loanPool.reserveOutBN && trade.target.reserveInBN && trade.target.reserveOutBN).gt(BN(1))
	) {
		const log = await tradeLogs(trade)
		console.log(log)
		// compare profit vs gas cost
		// logger.info(await data)// debug
		const actualProfit = await gasVprofit(trade)

		// If profit is greater than gas cost, execute trade
		if (BN(actualProfit.profit).gt(0)) {
			logger.info("Profitable trade found on " + trade.ticker + "!")
			logger.info("Profit: ", actualProfit.profit.toString(), "Gas Cost: ", u.formatUnits(actualProfit.gas.gasPrice, 18), "Flash Type: ", trade.type)
			pendingTrades.push(newTx)
			// Execute trade
			const x = await execute(trade, actualProfit)
			// if execute returns either txresponse or undefined, remove it from pendingTrades:
			if (x.txResponse || x.txResponse == undefined) {
				pendingTrades = pendingTrades.filter((tx) => tx.ID !== trade.ID)
			}
			return
		}

		// If profit is less than gas cost, return
		if (BN(actualProfit.profit).lte(0)) {
			console.log("<<<<<<<<<<<<No Trade After gasVprofit: " + trade.ticker + " [ gas > profit ] >>>>>>>>>>>>")
			return
		}

		// If profit is undefined, return
		if (actualProfit.profit == undefined) {
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>Profit is undefined: error in gasVProfit<<<<<<<<<<<<<<<<<<<<<<<<")
			return
		}

		// If profit is less than 0, return
	} else if (profpercBN.lte(0) /*&& profpercBN.gt(-0.6)*/) { // TESTING
		console.log("<<<<<<<<<<<<No Trade: " + trade.ticker + " [ profit < 0.3% | " + profpercBN.toFixed(trade.tokenOut.decimals) + " ] >>>>>>>>>>>>")
		return
	}
}