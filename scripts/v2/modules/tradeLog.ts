
import { BigNumber as BN } from "bignumber.js";
import { BigNumber } from "ethers";
import { BoolTrade } from "../../../constants/interfaces";
import { JS2BN, fu } from "./convertBN";
/**
 * This doc calculates whether trade will revert due to uniswak K being positive or negative
 * Uni V2 price formula: X * Y = K
 * @param trade 
 * @returns Uniswap K before and after trade, and whether it is positive or negative
 */

export async function tradeLogs(trade: BoolTrade): Promise<any> {
	try {
		const data = {
			trade: trade.type,
			ticker: trade.ticker,
			direction: trade.direction,
			tradeSize: fu(trade.target.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
			loanPool: {
				exchange: trade.loanPool.exchange,
				priceIn: trade.loanPool.priceIn,
				priceOut: trade.loanPool.priceOut,
				reservesIn: fu(trade.loanPool.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
				reservesOut: fu(trade.loanPool.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
				amountRepay: trade.type === "multi" ?
					(fu(trade.loanPool.amountRepay, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol) :
					(fu(trade.loanPool.amountRepay, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol),
				repaysObj:
				{
					simpleMulti: fu(trade.loanPool.repays.simpleMulti, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
					getAmountsOut: fu(trade.loanPool.repays.getAmountsOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
					getAmountsIn: fu(trade.loanPool.repays.getAmountsIn, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
				}
			},
			target: {
				exchange: trade.target.exchange,
				priceIn: trade.target.priceIn,
				priceOut: trade.target.priceOut,
				reservesIn: fu(trade.target.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
				reservesOut: fu(trade.target.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
				amountOut: fu(trade.target.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
			},
			result: {
				uniswapkPreT: trade.k.uniswapKPre.gt(0) ? trade.k.uniswapKPre.toString() : 0,
				uniswapkPosT: trade.k.uniswapKPost.gt(0) ? trade.k.uniswapKPost.toString() : 0,
				uniswapKPositive: trade.k.uniswapKPositive,
				// loanCostPercent: utils.formatUnits((trade.loanPool.amountOut.div(trade.amountRepay)).mul(100), trade.tokenOut.decimals),
				profit: fu(trade.profit, (trade.tokenOut.decimals)) + " " + (trade.tokenOut.symbol),
				profperc: fu(trade.profitPercent, (trade.tokenOut.decimals)) + "%",
			}
		}
		return data
	} catch (error: any) {
		console.log("Error in tradeLog.ts: " + error.message);
		return { data: "error" }
	}
}