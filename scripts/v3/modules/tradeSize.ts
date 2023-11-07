

export async function tradeSize() {

}


//SDK solutions are unacceptable as they do not work for anythign but Uniswap, unless they're hacked.
// import { ChainId, Fetcher, Pair, Token, TokenAmount, TradeType, Route, Trade } from '@uniswap/sdk';

// /**
//  * @description
//  *
//  * A function using the v3 sdk to beast a maxOutputAmount from a given pool, and a given output token.
//  * and a maximumAmountIn for a target pool, and a given input token,
//  * then chooses the minimum of the two for a tradeSize.
//  *
//  *  */


// const SLIPPAGE_TOLERANCE = 0.006; // 0.6%

// export async function getMaxTradeSize(): Promise<number> {
// 	const token0 = new Token(ChainId.MAINNET, '0x...', 18); // Replace with token0 address and decimals
// 	const token1 = new Token(ChainId.MAINNET, '0x...', 18); // Replace with token1 address and decimals
// 	const outputToken = new Token(ChainId.MAINNET, '0x...', 18); // Replace with output token address and decimals

// 	const pair = await Fetcher.fetchPairData(token0, token1); // Fetch the pair data
// 	const route = new Route([pair], token0); // Create a route for the token0 -> token1 trade

// 	const tickSpacing = pair.tickSpacing.toNumber();
// 	const tickLower = Math.floor(pair.liquidityProviderFeeStep.tickLower / tickSpacing) * tickSpacing;
// 	const tickUpper = Math.ceil(pair.liquidityProviderFeeStep.tickUpper / tickSpacng) * tickSpacing;

// 	const tickLowerPrice = route.priceAtTick(tickLower).toSignificant(6);
// 	const tickUpperPrice = route.priceAtTick(tickUpper).toSignificant(6);

// 	const maxOutputAmount = new TokenAmount(outputToken, 0); // Initialize max output amount to 0

// 	for (let i = 0; i < 10; i++) { // Loop through 10 input amounts to find the maximum output amount
// 		const inputAmount = new TokenAmount(token0, i * 1000); // Increment input amount by 1000 each iteration
// 		const trade = new Trade(
// 			route,
// 			inputAmount,
// 			TradeType.EXACT_INPUT
// 		);
// 		const outputAmount = trade.maximumAmountOut(
// 			maxOutputAmount,
// 			SLIPPAGE_TOLERANCE
// 		);
// 		if (outputAmount.greaterThan(maxOutputAmount)) {
// 			maxOutputAmount = outputAmount;
// 		}
// 	}

// 	const maxInputAmount = new TokenAmount(token0, 0); // Initialize max input amount to 0

// 	for (let i = 0; i < 10; i++) { // Loop through 10 output amounts to find the maximum input amount
// 		const outputAmount = new TokenAmount(outputToken, i * 1000); // Increment output amount by 1000 each iteration
// 		const trade = new Trade(
// 			route,
// 			outputAmount,
// 			TradeType.EXACT_OUTPUT
// 		);
// 		const inputAmount = trade.maximumAmountIn(
// 			maxInputAmount,
// 			SLIPPAGE_TOLERANCE
// 		);
// 		if (inputAmount.greaterThan(maxInputAmount)) {
// 			maxInputAmount = inputAmount;
// 		}
// 	}

// 	const maxTradeSize = Math.min(
// 		maxInputAmount.toSignificant(6),
// 		maxOutputAmount.toSignificant(6)
// 	);

// 	return maxTradeSize;
// }