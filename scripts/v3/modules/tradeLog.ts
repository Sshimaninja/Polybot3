
import { Bool3Trade } from "../../../constants/interfaces";
import { BigInt2BN, fu } from "../../modules/convertBN";
/**
 * This doc calculates whether trade will revert due to uniswak K being positive or negative
 * Uni V2 price formula: X * Y = K
 * @param trade 
 * @returns Uniswap K before and after trade, and whether it is positive or negative
 */

export async function tradeLogs(trade: Bool3Trade): Promise<any> {
	try {
		if (trade.target.amountOut > (0n)) {
			const data = {
				id: trade.ID,
				trade: trade.type,
				ticker: trade.ticker,
				direction: trade.direction,
				tradeSize: fu(trade.target.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
				loanPool: {
					exchange: trade.loanPool.exchange,
					fee: trade.loanPool.feeTier,
					priceIn: trade.loanPool.priceIn,
					priceOut: trade.loanPool.priceOut,
					repaysObj:
					{
						getAmountsOut: fu(trade.loanPool.amountRepay, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
						getAmountsIn: fu(trade.loanPool.amountRepay, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
					},
					amountRepay: trade.type === "multi" ? fu(trade.loanPool.amountRepay, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol : trade.type === "direct" ? fu(trade.loanPool.amountRepay, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol : "error",
					// amountRepay: fu(trade.loanPool.amountRepay, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol
				},
				target: {
					exchange: trade.target.exchange,
					fee: trade.target.feeTier,
					priceIn: trade.target.priceIn,
					priceOut: trade.target.priceOut,
					amountOut: fu(trade.target.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
				},
				result: {
					// uniswapkPreT: trade.k.uniswapKPre > 0n ? trade.k.uniswapKPre.toString() : 0,
					// uniswapkPosT: trade.k.uniswapKPost > 0n ? trade.k.uniswapKPost.toString() : 0,
					// uniswapKPositive: trade.k.uniswapKPositive,
					// loanCostPercent: fu((trade.loanPool.amountOut.div(trade.amountRepay)).mul(100), trade.tokenOut.decimals),
					profit: fu(trade.profits.tokenProfit, (trade.tokenOut.decimals)) + " " + (trade.tokenOut.symbol),
					WMATICProfit: fu(trade.profits.WMATICProfit, 18) + " WMATIC",
				}
			}
			return data
		}
	} catch (error: any) {
		console.log("Error in tradeLog.ts: " + error.message);
		return { data: "error" }
	}
}