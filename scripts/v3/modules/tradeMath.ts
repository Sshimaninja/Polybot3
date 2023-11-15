import { BigNumber as BN } from "bignumber.js";
import { PoolState } from "../../../constants/interfaces";
/**
 * 
 * @param reserveIn 
 * @param reserveOut 
 * @param targetPrice 
 * @param slippageTolerance 
 * @returns maximum trade size for a given pair, taking into account slippage
 */


/*

// */
// export async function getMaxTokenIn(targetPrice: BN, sqrtp_cur: BN, liq: BN): Promise<BN> {
// 	const q96 = BN(2).pow(96);
// 	const price_next = targetPrice.sqrt().multipliedBy(q96);
// 	const price_diff = price_next.minus(sqrtp_cur);
// 	const maxTokenIn = price_diff.multipliedBy(liq).dividedBy(q96);
// 	return maxTokenIn;
// }

// export async function getMaxTokenOut(targetPrice: BN, sqrtp_cur: BN, liq: BN): Promise<BN> {
// 	const q96 = BN(2).pow(96);
// 	const price_next = targetPrice.sqrt().multipliedBy(q96);
// 	const price_diff = sqrtp_cur.minus(price_next);
// 	const maxTokenOut = price_diff.multipliedBy(liq).dividedBy(q96);
// 	return maxTokenOut;
// }

// A sort of reference: https://uniswapv3book.com/docs/milestone_1/first-swap/#first-swap
// amount_in = 42 * eth
// price_diff = (amount_in * q96) // liq
// price_next = sqrtp_cur + price_diff
// print("New price:", (price_next / q96) ** 2)
// print("New sqrtP:", price_next)
// print("New tick:", price_to_tick((price_next / q96) ** 2))
// # New price: 5003.913912782393
// # New sqrtP: 5604469350942327889444743441197
// # New tick: 85184

export async function tradeToPrice(targetPrice: BN, sqrtp_cur: BN, liq: BN): Promise<BN> {
	const q96 = BN(2).pow(96);
	const price_next = targetPrice.sqrt().multipliedBy(q96);
	const price_diff = price_next.minus(sqrtp_cur);
	const amount_in = price_diff.multipliedBy(liq).dividedBy(q96);
	return amount_in;
}
