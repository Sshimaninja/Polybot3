import { BigNumber as BN } from "bignumber.js";
/**
 * 
 * @param reserveIn 
 * @param reserveOut 
 * @param targetPrice 
 * @param slippageTolerance 
 * @returns maximum trade size for a given pair, taking into account slippage
 */


/*
 - getMaxToken0In:
 - ex: this pool's reserveIn/reserveOut: 1000 / 1580000 = 1/1580 = token0: 0.0006329113924050633 token1: 1580
 - currentPrice = 0.0006329113924050633
 - slippage = 0.002 = 0.2%
 - slippageNum = currentPrice  * slippage = 0.0006329113924050633 * 0.002 = 0.0000012658227848101266
 - targetPrice = currentPrice + slippageNum = 0.0006329113924050633 - 0.0000012658227848101266 = 0.000634177215189873
 - targetReserves = targetPrice * reserveOut = 0.000634177215189873 * 1580000 = 1,001.99999999999934
 - maxToken0In = targetReserves - reserveIn = 1,001.99999999999934 - 1000 = 1.99999999999934
 */

export async function getMaxTokenIn(reserveIn: BN, reserveOut: BN, slippageTolerance: BN): Promise<BN> {
	const currentToken0Price = reserveOut.div(reserveIn);
	const slippageNum = currentToken0Price.multipliedBy(slippageTolerance);
	const targetPrice = currentToken0Price.plus(slippageNum);
	const targetReserves = targetPrice.multipliedBy(reserveIn);
	if (reserveIn.lt(targetReserves)) {
		console.log('[getMaxTokenIn:] targetReserves must be higher than reserveIn or else maxToken0In will be negative')
	}
	const maxToken0In = targetReserves.minus(reserveIn);
	return maxToken0In
}

/*
- getMaxToken1Out:
- ex: this pool's reserveIn/reserveOut: 1000 / 1580000 = 1/1580
- currentPrice = 1580
- slippage = 0.002 = 0.2%
- slippageNum = currentPrice * slippage = 1580 * 0.002 = 3.16
- lowestPrice = currentPrice - slippageNum = 1580 - 3.16 = 1576.84
- targetReserves = reserveIn * lowestPrice = 1000 * 1576.84 = 1576840
- maxToken1Out = reserveOut - targetReserves = 1580000 - 1576840 = 3160
*/

export async function getMaxTokenOut(reserveIn: BN, reserveOut: BN, slippageTolerance: BN): Promise<BN> {
	const currentToken1Price = reserveIn.div(reserveOut);
	const slippageNum = currentToken1Price.multipliedBy(slippageTolerance);
	const lowestPrice = currentToken1Price.minus(slippageNum);
	const targetReserves = reserveIn.multipliedBy(lowestPrice);
	if (reserveOut.lt(targetReserves)) {
		console.log('[getMaxTokenOut:] targetReserves must be higher than reserveOut or else maxToken1Out will be negative')
	}
	const maxToken1Out = reserveOut.minus(targetReserves);
	return maxToken1Out;
}

/*
- tradeToPrice Equation: 
- ex: this pool's reserveIn/reserveOut: 1000 / 1580000 = 1/1580
- targetPrice = 1 / 1659 (must be higher than currentPrice)
- currentPrice = 1 / 1580
- difference = 1659 - 1580 = 79
- liquidity needed = difference * reserveIn = tradeSize = 79 * 1000 = 79000
- checkMath = 1580000 + 79000 = 1659000
 */

export async function tradeToPrice(reserveIn: BN, reserveOut: BN, targetPrice: BN, slippageTolerance: BN): Promise<BN> {
	const currentPrice = reserveOut.div(reserveIn); // 1580
	const diff = targetPrice.minus(currentPrice); // 1650 - 1580 = 70
	if (targetPrice.lt(currentPrice)) {
		console.log('[tradeToPrice:] targetPrice must be higher than currentPrice or else tradeSize will be negative');
		console.log('currentPrice: ', currentPrice.toFixed(6), 'targetPrice: ', targetPrice.toFixed(6));
	}
	const tradeSize = diff.multipliedBy(reserveIn); // 70 * 1000 = 70000
	return tradeSize
}

