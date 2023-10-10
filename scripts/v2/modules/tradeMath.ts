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
	const currentPrice = reserveOut.div(reserveIn);
	const slippageNum = currentPrice.multipliedBy(slippageTolerance);
	const targetPrice = currentPrice.plus(slippageNum);
	const targetReserves = targetPrice.multipliedBy(reserveIn);
	if (reserveIn.lt(targetReserves)) {
		console.log('[getMaxTokenIn]: targetReserves must be higher than reserveIn or else maxToken0In will be negative');
		console.log('[tradeToPrice]: currentPrice: ', currentPrice.toFixed(6), 'targetPrice: ', targetPrice.toFixed(6));
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
	const currentPrice = reserveOut.div(reserveIn);
	const slippageNum = currentPrice.multipliedBy(slippageTolerance);
	const targetPrice = currentPrice.minus(slippageNum);
	const targetReserves = reserveOut.multipliedBy(targetPrice);
	if (reserveOut.lt(targetReserves)) {
		console.log('[getMaxTokenOut]: targetReserves must be higher than reserveOut or else maxToken1Out will be negative')
		console.log('[tradeToPrice]: currentPrice: ', currentPrice.toFixed(6), 'targetPrice: ', targetPrice.toFixed(6));

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


// THIS APPEARS CORRECT - ERROR IN TRADELOGS IS ELSEWHERE - CHECK MATH
export async function tradeToPrice(reserveIn: BN, reserveOut: BN, targetPrice: BN, slippageTolerance: BN): Promise<BN> {
	//targetPrice 0.520670400977951207 + 0.519935327393096545 = 1.040605728371047752 / 2 = 0.520302864185523876
	const currentPrice = reserveOut.div(reserveIn); // 64133 / 123348 = 0.51993546713363816194830884975841
	const diff = targetPrice.minus(currentPrice); // 0.520302864185523876 - 0.51993546713363816194830884975841 = 0.00036739705188571405169115024159
	if (targetPrice.lt(currentPrice)) {
		console.log('[tradeToPrice]: targetPrice must be higher than currentPrice or else tradeSize will be negative');
		console.log('[tradeToPrice]: currentPrice: ', currentPrice.toFixed(6), 'targetPrice: ', targetPrice.toFixed(6));
	}
	const tradeSize = diff.multipliedBy(reserveIn); // 0.00036739705188571405169115024159 * 123348 = 45.285714285714285714285714285714
	return tradeSize // 45.285714285714285714285714285714
}

