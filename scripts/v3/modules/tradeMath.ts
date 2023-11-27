import { BigNumber as BN } from "bignumber.js";
import { PoolState } from "../../../constants/interfaces";
/**
 * @param reserveIn 
 * @param reserveOut 
 * @param targetPrice 
 * @param slippageTolerance 
 * @returns maximum trade size for a given pair, taking into account slippage
 */
export async function tradeToPrice(targetPrice: BN, currentPrice: BN, liq: BN): Promise<BN> {
	const price_diff = targetPrice.minus(currentPrice);
	const amount_in = price_diff.multipliedBy(liq);
	if (targetPrice.lte(currentPrice)) {
		console.log("targetPrice is less than currentPrice, returning 0")
		return new BN(0);
	} else {
		return amount_in;
	};
}