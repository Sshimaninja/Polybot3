import { Bool3Trade } from "../../../constants/interfaces";
import { V3Quote } from "./price/v3Quote";
import { PopulateRepays } from "./populateRepays";
// import { getK } from "./modules/getK";
import { filterTrade } from "./filterTrade";
import { flashV3Multi } from "../../../constants/environment";
import { fu, pu } from "../../modules/convertBN";
import { addFee } from "./calc";
import { VolToTarget } from "./price/ref/CalcVolToTargetSIMPLE";
import { params } from "./transaction/params";

export async function populateTrade(trade: Bool3Trade) {
	//console.log("Populating trade: ", trade.ticker, trade.loanPool.exchange, trade.target.exchange)
	const v = new VolToTarget(
		trade.target.exchange,
		trade.tokenIn,
		trade.tokenOut,
		trade.target.pool,
		trade.target.inRangeLiquidity,
		trade.target.priceTarget
	)

	trade.target.tradeSize = await v.calcVolToTarget()
	//console.log("Trade size: ", fu(trade.target.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol)
	if (trade.target.tradeSize === 0n) {
		//console.log("Trade size is 0, returning trade: ", trade.ticker, trade.loanPool.exchange, trade.target.exchange)
		return trade
	}

	const qt = new V3Quote(
		trade.target.pool,
		trade.target.exchange,
		trade.target.protocol,
		trade.tokenIn,
		trade.tokenOut
	)

	if (trade.target.tradeSize === 0n) {
		console.log("Trade size is 0, returning trade: ", trade.ticker, trade.loanPool.exchange, trade.target.exchange)
		return trade
	}
	//console.log("Getting quote... ")
	trade.target.amountOut = (await qt.maxOut(trade.target.tradeSize)).amountOut
	//console.log("Quote: trade.target.amountOut: ", fu(trade.target.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol)

	const repay = new PopulateRepays(trade, qt)

	// Define repay & profit for each trade type:
	const multi = await repay.getMulti()
	//const direct = await repay.getDirect()


	trade.type = "flashV3Multi"


	trade.loanPool.amountRepay = multi.repay.repay

	trade.profits.tokenProfit = multi.profits.profit

	trade.contract = flashV3Multi //trade.type === 'multi' ? flashV3Multi : flashDirect

	trade.params = await params(trade);
	// Make sure there are no breaking variables in the trade: before passing it to the next function.
	await filterTrade(trade)

	return trade;
}