import { BigNumber as BN } from "bignumber.js";
import { ChainId, Fetcher, Pair, Token, TokenAmount, TradeType, Route, Trade } from '@uniswap/sdk';
/**
 * 
 * @param reserveIn 
 * @param reserveOut 
 * @param targetPrice 
 * @param slippageTolerance 
 * @returns maximum trade size for a given pair, taking into account slippage
 */

const SLIPPAGE_TOLERANCE = 0.006; // 0.6%
export async function getOptimalTradeSize(inputToken: Token, outputToken: Token): Promise<TokenAmount> {
	const token0 = new Token(ChainId.MAINNET, '0x...', 18); // Replace with token0 address and decimals
	const token1 = new Token(ChainId.MAINNET, '0x...', 18); // Replace with token1 address and decimals

	const inputPair = await Fetcher.fetchPairData(inputToken, token0); // Fetch the input pair data
	const inputRoute = new Route([inputPair], inputToken); // Create a route for the input token -> token0 trade

	const outputPair = await Fetcher.fetchPairData(token1, outputToken); // Fetch the output pair data
	const outputRoute = new Route([outputPair], token1); // Create a route for the token1 -> output token trade

	const inputTrade = new Trade(
		inputRoute,
		new TokenAmount(inputToken, 0),
		TradeType.EXACT_INPUT
	);

	const maxInputAmount = inputTrade.maximumAmountOut(
		new TokenAmount(token0, 0),
		SLIPPAGE_TOLERANCE
	).toSignificant(6);

	const outputTrade = new Trade(
		outputRoute,
		new TokenAmount(token1, maxInputAmount),
		TradeType.EXACT_INPUT
	);

	const maxOutputAmount = outputTrade.maximumAmountOut(
		new TokenAmount(outputToken, 0),
		SLIPPAGE_TOLERANCE
	).toSignificant(6);

	const optimalTradeSize = Math.min(maxInputAmount, maxOutputAmount);

	return new TokenAmount(outputToken, optimalTradeSize);
}

// export async function getTradeSize(reserveIn: BN, reserveOut: BN, targetPrice: BN, slippageTolerance: BN): Promise<BN> {
// 	// Calculate the expected trade size without considering slippage
// 	// ex reserveIn/reserveOut: 300000 / 10
// 	// currentPrice = 30000 / 1
// 	// targetPrice = 30000 / 1.2 = 25000
// 	const expectedTradeSize = reserveIn.minus(targetPrice.multipliedBy(reserveOut)); // 300000 - (25000 * 10) = 50000

// 	// Calculate the maximum allowed slippage in the trade
// 	const maxSlippage = expectedTradeSize.multipliedBy(slippageTolerance); //50000 * 0.1 = 5000

// 	// Calculate the required tokenIn considering slippage
// 	const requiredTokenIn = maxSlippage; // 5000

// 	// If this is negative, then the trade would need to be reversed, which is additional complexity to be handled later
// 	// return requiredTokenIn;
// 	return requiredTokenIn.gt(0) ? requiredTokenIn : new BN(0);
// }

