
import { utils as f } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { BoolTrade } from "../../../constants/interfaces";
/**
 * This doc calculates whether trade will revert due to uniswak K being positive or negative
 * Uni V2 price formula: X * Y = K
 * @param trade 
 * @returns Uniswap K before and after trade, and whether it is positive or negative
 */

export async function tradeLogs(trade: BoolTrade): Promise<any> {
	try {
		const u = f.formatUnits
		const data = {
			trade: trade.type,
			ticker: trade.ticker,
			direction: trade.direction,
			tradeSize: u(trade.recipient.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
			loanPool: {
				exchange: trade.loanPool.exchange,
				priceIn: trade.loanPool.priceIn,
				priceOut: trade.loanPool.priceOut,
				reservesIn: u(trade.loanPool.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
				reservesOut: u(trade.loanPool.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
				amountRepay:
					trade.type === "multi" ? (
						u(trade.amountRepay, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol
					) : trade.type === "direct" ? (
						u(trade.amountRepay, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol) : "error",
				amountOut: u(trade.loanPool.amountRepay, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,

			},
			recipient: {
				exchange: trade.recipient.exchange,
				priceIn: trade.recipient.priceIn,
				priceOut: trade.recipient.priceOut,
				reservesIn: u(trade.recipient.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
				reservesOut: u(trade.recipient.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
				amountOut: u(trade.recipient.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
			},
			result: {
				uniswapkPre: trade.k.uniswapKPre.gt(0) ? trade.k.uniswapKPre.toString() : 0,
				uniswapkPost: trade.k.uniswapKPost.gt(0) ? trade.k.uniswapKPost.toString() : 0,
				uniswapKPositive: trade.k.uniswapKPositive,
				// loanCostPercent: utils.formatUnits((trade.loanPool.amountOut.div(trade.amountRepay)).mul(100), trade.tokenOut.decimals),
				profit: u(trade.profit, (trade.direction === "multi" ? trade.tokenOut.decimals : trade.tokenIn.decimals)) + " " + (trade.direction === "multi" ? trade.tokenOut.symbol : trade.tokenIn.symbol),
				profperc: BN(f.formatUnits(trade.profitPercent, (trade.direction === "multi" ? trade.tokenOut.decimals : trade.tokenIn.decimals))).toFixed((trade.direction === "multi" ? trade.tokenOut.decimals : trade.tokenIn.decimals)) + "%",
			}
		}
		return data
	} catch (error: any) {
		console.log("Error in tradeLog.ts: " + error.message);
		return { data: "error" }
	}
}