import { BigNumber } from "ethers";
import { BoolTrade, K } from "../../../constants/interfaces";

/**
 * This doc calculates whether trade will revert due to uniswak K being positive or negative
 * Uni V2 price formula: X * Y = K
 * @param trade 
 * @returns Uniswap K before and after trade, and whether it is positive or negative
 */

export async function getK(trade: BoolTrade): Promise<K> {
	let kalc = {
		uniswapKPre: BigNumber.from(0),
		uniswapKPost: BigNumber.from(0),
		uniswapKPositive: false,
	}
	if (trade.type === "multi") {
		kalc = {
			uniswapKPre:
				// 1000 * 2000 = 2000000 
				trade.loanPool.reserveIn.mul(trade.loanPool.reserveOut),
			uniswapKPost:
				// 200000 = 1800 * 110
				//subtract loan: 
				trade.loanPool.reserveIn.sub(trade.recipient.tradeSize)
					// multiply by new reservesOut by adding tradeSizeInTermsOfTokenOut
					.mul(trade.loanPool.reserveOut.add((trade.recipient.tradeSize.mul(1003009027).div(1000000000))
						// get the price of loanpool tokenOut and multiply by tradeSize
						.mul(trade.loanPool.reserveOut.div(trade.loanPool.reserveIn))))
			,
			uniswapKPositive: false,
		}
	}
	if (trade.type === "direct") {
		kalc = {
			uniswapKPre: trade.loanPool.reserveIn.mul(trade.loanPool.reserveOut),
			uniswapKPost: trade.loanPool.reserveIn
				.add(trade.loanPool.reserveIn.add(trade.recipient.tradeSize.mul(1003009027).div(1000000000)))
				.mul(trade.loanPool.reserveOut),
			uniswapKPositive: false,
		}
	} else {
		kalc = {
			uniswapKPre: BigNumber.from(0),
			uniswapKPost: BigNumber.from(0),
			uniswapKPositive: false,
		}
	}
	return kalc;
}