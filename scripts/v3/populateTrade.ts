import { Bool3Trade } from "../../constants/interfaces";
import { V3Quote } from "./modules/price/V3Quote2";
import { PopulateRepays } from "./modules/populateRepays";
import { getK } from "./modules/getK";
import { filterTrade } from "./modules/filterTrade";
import { flashMulti } from "../../constants/environment";
import { pu } from "../modules/convertBN";

export async function populateTrade(trade: Bool3Trade) {

	const q = new V3Quote(
		trade.loanPool.pool,
		trade.loanPool.exchange,
		trade.loanPool.feeTier
	)

	trade.target.amountOut = await q.maxOut(trade.target.tradeSize)

	// console.log("Quote: trade.target.amountOut: ", fu(trade.target.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol)

	const repay = new PopulateRepays(trade, trade.loanPool.calc, q)

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

	trade.k = await getK(trade, trade.loanPool.state, trade.loanPool.calc, q)

	trade.flash = flashMulti //trade.type === 'multi' ? flashMulti : flashDirect

	// Make sure there are no breaking variables in the trade: before passing it to the next function.
	const filteredTrade = await filterTrade(trade)

	return trade;
}