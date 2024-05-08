import { Bool3Trade } from "../../constants/interfaces";
import { V3Quote } from "./modules/price/v3Quote";
import { PopulateRepays } from "./modules/populateRepays";
// import { getK } from "./modules/getK";
import { filterTrade } from "./modules/filterTrade";
import { flashMulti } from "../../constants/environment";
import { fu, pu } from "../modules/convertBN";
import { AmountConverter } from "./modules/amountConverter";
import { volToTarget } from "./modules/price/ref/calcVolToTarget";

export async function populateTrade(trade: Bool3Trade) {

	// const calc = new AmountConverter(trade)
	// const ql = new V3Quote(
	// 	trade.loanPool.pool,
	// 	trade.loanPool.exchange,
	// 	trade.loanPool.protocol,
	// 	trade.tokenIn,
	// 	trade.tokenOut
	// )
	const qt = new V3Quote(
		trade.target.pool,
		trade.target.exchange,
		trade.target.protocol,
		trade.tokenIn,
		trade.tokenOut
	)

	if (trade.target.tradeSize === 0n) {
		// console.log("Trade size is 0, returning trade: ", trade.ticker, trade.loanPool.exchange, trade.target.exchange)
		return trade
	}
	console.log("Getting quote... ")
	trade.target.amountOut = (await qt.maxOut(trade.target.tradeSize)).amountOut
	console.log("Quote: trade.target.amountOut: ", fu(trade.target.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol)

	const repay = new PopulateRepays(trade, calc, qt)

	// Define repay & profit for each trade type:
	const multi = await repay.getMulti()
	const direct = await repay.getDirect()

	trade.type =
		multi.profits.profit > direct.profit
			? 'multi'
			: direct.profit > multi.profits.profit
				? 'direct'
				: 'error'

	trade.loanPool.amountRepay =
		trade.type === 'multi' ? multi.repays.repay : direct.repay

	trade.loanPool.repays = multi.repays

	trade.profit =
		trade.type === 'multi' ? multi.profits.profit : direct.profit

	trade.profitPercent =
		trade.type == 'multi'
			? pu(
				multi.profits.profitPercent.toFixed(
					trade.tokenOut.decimals
				),
				trade.tokenOut.decimals
			)
			: pu(
				direct.percentProfit.toFixed(trade.tokenOut.decimals),
				trade.tokenOut.decimals
			)

	// trade.k = await getK(trade, trade.loanPool.state, calc, q)

	trade.flash = flashMulti //trade.type === 'multi' ? flashMulti : flashDirect

	// Make sure there are no breaking variables in the trade: before passing it to the next function.
	await filterTrade(trade)

	return trade;
}