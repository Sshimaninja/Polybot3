import { Bool3Trade } from "../../../constants/interfaces";
import { V3Quote } from "./price/v3Quote";
import { TokenProfits } from "./tokenProfits";
// import { getK } from "./modules/getK";
import { filterTrade } from "./filterTrade";
import { flashV3Multi } from "../../../constants/environment";
import { fu, pu } from "../../modules/convertBN";
import { addFee } from "./calc";
import { VolToTarget } from "./price/ref/CalcVolToTargetSIMPLE";
import { params } from "./transaction/params";
import { importantSafetyChecks } from "./importantSafetyChecks";

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
	const qlp = new V3Quote(
		trade.loanPool.pool,
		trade.loanPool.exchange,
		trade.loanPool.protocol,
		trade.tokenIn,
		trade.tokenOut
	)

	if (trade.target.tradeSize === 0n) {
		console.log("Trade size is 0, returning trade: ", trade.ticker, trade.loanPool.exchange, trade.target.exchange)
		return trade
	}
	try {
		//console.log("Getting quote... ")
		trade.target.amountOut = (await qt.maxOut(trade.target.tradeSize)).amountOut
		//console.log("Quote: trade.target.amountOut: ", fu(trade.target.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol)
	} catch (e: any) {
		if (trade.loanPool.state.liquidity > trade.target.state.liquidity) {
			console.log("Error in amountOut calc populateTrade.maxOut: loanPool liquidity is greater than target liquidity.")
		} else {
			console.log("Error in amountOut calc populateTrade.maxOut: target liquidity is greater than loanPool liquidity.")
		}
		let data = {
			tradeSize: fu(trade.target.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
			loanPoolLiq: trade.loanPool.state.liquidity,
			loanPoolR0: trade.loanPool.state.reserves0,
			loanPoolR1: trade.loanPool.state.reserves1,
			targetLiq: trade.target.state.liquidity,
			targetR0: trade.target.state.reserves0,
			targetR1: trade.target.state.reserves1,
		}
		console.log("Error in amountOut calc populateTrade.minIn: ")
		console.log(data)
	}
	trade.safe = await filterTrade(trade);
	trade.safe = await importantSafetyChecks(trade);

	if (!trade.safe) {
		console.log("unsafe trade: ", trade.ticker, trade.loanPool.exchange, trade.target.exchange)
		return trade
	}
	try {
		const repay = await qlp.minIn( //Will output tokenIn.
			trade.target.tradeSize
		)
		trade.loanPool.amountRepay = repay.amountIn
	} catch (e: any) {
		if (trade.loanPool.state.liquidity > trade.target.state.liquidity) {
			console.log("Error in repay calc populateTrade.minIn: loanPool liquidity is greater than target liquidity.")
		} else {
			console.log("Error in repay calc populateTrade.minIn: target liquidity is greater than loanPool liquidity.")
		}
		let data = {
			tradeSize: fu(trade.target.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
			loanPoolLiq: trade.loanPool.state.liquidity,
			loanPoolR0: trade.loanPool.state.reserves0,
			loanPoolR1: trade.loanPool.state.reserves1,
			targetLiq: trade.target.state.liquidity,
			targetR0: trade.target.state.reserves0,
			targetR1: trade.target.state.reserves1,
		}
		console.log("Error in repay calc populateTrade.minIn: ")
		console.log(data)
	}
	const p = new TokenProfits(trade, qlp)

	// Define repay & profit for each trade type:
	const multi = await p.getMulti()
	//const direct = await repay.getDirect()

	trade.type = "flashV3Multi"

	//trade.loanPool.amountRepay = multi.repay.repay

	trade.profits.tokenProfit = multi.profits.profit

	trade.contract = flashV3Multi //trade.type === 'multi' ? flashV3Multi : flashDirect

	trade.params = await params(trade);
	// Make sure there are no breaking variables in the trade: before passing it to the next function.
	await filterTrade(trade)

	return trade;
}