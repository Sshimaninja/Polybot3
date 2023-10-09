
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

	const u = f.formatUnits
	const data = {
		trade: trade.type,
		ticker: trade.ticker,
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
			amountOut: u(trade.loanPool.amountOut, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,

		},
		recipient: {
			exchange: trade.recipient.exchange,
			priceIn: trade.recipient.priceIn,
			priceOut: trade.recipient.priceOut,
			reservesIn: u(trade.recipient.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
			reservesOut: u(trade.recipient.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
			tradeSize: u(trade.recipient.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
			amountOut: u(trade.recipient.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
		},
		result: {
			uniswapkPre: trade.k.uniswapKPre.gt(0) ? trade.k.uniswapKPre.toString() : 0,
			uniswapkPost: trade.k.uniswapKPost.gt(0) ? trade.k.uniswapKPost.toString() : 0,
			uniswapKPositive: trade.k.uniswapKPositive,
			// loanCostPercent: utils.formatUnits((trade.loanPool.amountOut.div(trade.amountRepay)).mul(100), trade.tokenOut.decimals),
			profit: u(trade.profit, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
			profperc: BN(f.formatUnits(trade.profitPercent, trade.tokenOut.decimals)).toFixed(trade.tokenOut.decimals) + "%",
		}
	}
	const basicData = {
		ticker: trade.ticker,
		exchanges: trade.loanPool.exchange + " / " + trade.recipient.exchange,
		tradeSize: u(trade.recipient.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
		direction: trade.direction,
		type: trade.type,
		prices: {
			loanPool: {
				exchange: trade.loanPool.exchange,
				priceIn: trade.loanPool.priceIn + '/1',
				priceOut: trade.loanPool.priceOut + '/1',
			},
			recipient: {
				exchange: trade.recipient.exchange,
				priceIn: trade.recipient.priceIn + '/1',
				priceOut: trade.recipient.priceOut + '/1',
			},
			difference: {
				In: BN(trade.loanPool.priceIn).minus(BN(trade.recipient.priceIn)).dividedBy(BN(trade.loanPool.priceIn)).multipliedBy(100).toFixed(trade.tokenIn.decimals) + '%',
				Out: BN(trade.loanPool.priceOut).minus(BN(trade.recipient.priceOut)).dividedBy(BN(trade.loanPool.priceOut)).multipliedBy(100).toFixed(trade.tokenOut.decimals) + '%',
			}
		},
		profit: u(trade.profit, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
		profitPercent: BN(f.formatUnits(trade.profitPercent, trade.tokenOut.decimals)).toFixed(trade.tokenOut.decimals) + "%",
		// gasCost: trade.gasData,
	}

	return { data, basicData }
	// console.log(d);
}