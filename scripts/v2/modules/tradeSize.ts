import { ChainId, Fetcher, Pair, Token, TokenAmount, TradeType, Route, Trade } from '@uniswap/sdk';

const SLIPPAGE_TOLERANCE = 0.006; // 0.6%

export async function getMaxTradeSize(): Promise<number> {
	const token0 = new Token(ChainId.MAINNET, '0x...', 18); // Replace with token0 address and decimals
	const token1 = new Token(ChainId.MAINNET, '0x...', 18); // Replace with token1 address and decimals
	const outputToken = new Token(ChainId.MAINNET, '0x...', 18); // Replace with output token address and decimals

	const pair = await Fetcher.fetchPairData(token0, token1); // Fetch the pair data
	const route = new Route([pair], token0); // Create a route for the token0 -> token1 trade

	const trade = new Trade(
		route,
		new TokenAmount(token0, 0),
		TradeType.EXACT_INPUT
	);

	const maxOutputAmount = trade.maximumAmountOut(
		new TokenAmount(outputToken, 0),
		SLIPPAGE_TOLERANCE
	).toSignificant(6);

	const maxInputAmount = trade.maximumAmountIn(
		new TokenAmount(token0, maxOutputAmount),
		SLIPPAGE_TOLERANCE
	).toSignificant(6);

	const maxTradeSize = Math.min(maxInputAmount, maxOutputAmount);

	return maxTradeSize;
}