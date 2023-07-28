Assume all trade directions are token0

```
gasVprofit = pair.getAmountsOut(token, matic)
actuaProfit = profit(inMATIC) - gasPrice(inMATIC)
If token1 is MATIC, return actualProfit
If token0 is MATIC, call getGasVProfit(token1)
If neither token0 or token1 are MATIC, call getPair(token1, MATIC) on all uniswapFactories
    If getPair(token1, MATIC) returns a valid pair, call getGasVProfit(token1)
    If getPair(token1, MATIC) returns an invalid pair address, call getPair(token1, gasToken) on all uniswapFactories
    If getPair(token1, gasToken) returns an invalid pair address, call getAmountsOut(amountIn, token0, MATIC)
    If getPair(token1, gasToken) returns a pair, call (gasTokenOut = getAmountsOut(token1, gasToken)), then call getAmountsOut(gasTokeOut, MATIC) and return the amountOut in MATIC

If token0 or token1 match a gasToken, call getGasVProfit(token0) or getGasVProfit(token1)
If neither token0 nor token1 matches a token listed in gasToken object, call getPair(token1, gasToken) on all uniswapFactories
If getPair(token1, gasToken) returns a pair///FIGURE OUT THE REST.

```

```

```
