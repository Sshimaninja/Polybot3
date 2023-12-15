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
	const priceDiff = targetPrice.minus(currentPrice);
	const amountIn = priceDiff.multipliedBy(liq);
	if (targetPrice.lte(currentPrice)) {
		console.log("targetPrice lt currentPrice, returning 0")
		return new BN(0);
	} else {
		return amountIn;
	};
}

export function sqrt(x: BN) {
	let z = new BN(x.plus(new BN(2).pow(96)).div(2).toFixed());
	let y = x;
	while (z.minus(y).isGreaterThan(0)) {
		y = z;
		z = x.div(z).plus(z).div(2);
	}
	return y;
}