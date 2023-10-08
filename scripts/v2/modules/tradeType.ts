import { BigNumber as BN } from "bignumber.js";
import { ChainId, Fetcher, Pair, Token, TokenAmount, TradeType, Route, Trade } from '@uniswap/sdk';
import { BigNumber } from "ethers";
/**
 * 
 * @param reserveIn 
 * @param reserveOut 
 * @param targetPrice 
 * @param slippageTolerance 
 * @returns maximum trade size for a given pair, taking into account slippage
 */

export async function getMaxTokenIn(reserveIn: BN, reserveOut: BN, slippageTolerance: BN): Promise<BN> {
	// Calculate the maximum allowed slippage in the trade
	const maxSlippage = reserveIn.multipliedBy(slippageTolerance);

	// Calculate the maximum amount of tokenIn that can be added to the pool without going over the slippageTolerance
	const maxTokenIn = maxSlippage.plus(reserveIn).multipliedBy(reserveOut).dividedBy(reserveOut.minus(maxSlippage));

	// If this is negative, then the trade would need to be reversed, which is additional complexity to be handled later
	return maxTokenIn.gt(0) ? maxTokenIn : new BN(0);
}

export async function getMaxTokenOut(reserveOut: BN, slippageTolerance: BN): Promise<BN> {
	// Calculate the maximum allowed slippage in the trade
	const maxSlippage = reserveOut.multipliedBy(slippageTolerance);

	// Calculate the maximum amount of tokenOut that can be added to the pool without causing greater than slippageTolerance slippage
	const maxTokenOut = maxSlippage.dividedBy(new BN(1).minus(slippageTolerance));

	// If this is negative, then the trade would need to be reversed, which is additional complexity to be handled later
	return maxTokenOut.gt(0) ? maxTokenOut : new BN(0);
}

export async function tradeToPrice(reserveIn: BN, reserveOut: BN, targetPrice: BN, slippageTolerance: BN): Promise<BN> {
	// Calculate the expected trade size without considering slippage
	// ex reserveIn/reserveOut: 300000 / 10
	// currentPrice = 30000 / 1
	// targetPrice = 30000 / 1.2 = 25000
	const expectedTradeSize = reserveIn.minus(targetPrice.multipliedBy(reserveOut)); // 300000 - (25000 * 10) = 50000

	return expectedTradeSize;

}



// // USE THE FOLLOWING TO ACCOUNT FOR SLIPPAGE TOLERANCE
// // Calculate the maximum allowed slippage in the trade
// const maxSlippage = expectedTradeSize.multipliedBy(slippageTolerance); //50000 * 0.1 = 5000

// // Calculate the required tokenIn considering slippage
// const requiredTokenIn = maxSlippage; // 5000

// If this is negative, then the trade would need to be reversed, which is additional complexity to be handled later
// return requiredTokenIn;
// return requiredTokenIn.gt(0) ? requiredTokenIn : new BN(0);




// const SLIPPAGE_TOLERANCE = 0.006; // 0.6%
// export async function getOptimalTradeSize(tokenIn: Token, tokenOut: Token, slippageTolerance: number): Promise<BigNumber> {

// 	const inputPair = await Fetcher.fetchPairData(tokenIn, tokenOut); // Fetch the input pair data
// 	const inputRoute = new Route([inputPair], tokenIn, tokenOut); // Create a route for the input token -> token0 trade

// 	const outputPair = await Fetcher.fetchPairData(tokenOut, tokenIn); // Fetch the output pair data
// 	const outputRoute = new Route([outputPair], tokenOut, tokenIn); // Create a route for the token1 -> output token trade

// 	const inputTrade = new Trade(
// 		inputRoute,
// 		new TokenAmount(tokenIn, 0),
// 		TradeType.EXACT_INPUT
// 	);

// 	const maxInputAmount = inputTrade.maximumAmountIn(slippageTolerance);


// 	const outputTrade = new Trade(
// 		outputRoute,
// 		new TokenAmount(token1, maxInputAmount),
// 		TradeType.EXACT_INPUT
// 	);

// 	const maxOutputAmount = outputTrade.maximumAmountOut(
// 		new TokenAmount(tokenOut, 0),
// 		SLIPPAGE_TOLERANCE
// 	).toSignificant(6);

// 	const optimalTradeSize = Math.min(maxInputAmount, maxOutputAmount);

// 	return new TokenAmount(tokenOut, optimalTradeSize);
// }