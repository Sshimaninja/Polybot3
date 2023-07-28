Assume all trade directions are token0 to token1
All functions must return 'actualProfit' in MATIC

```
gasVprofit = pair.getAmountsOut(profit, token, matic)
actuaProfit = profit(inMATIC) - gasPrice(inMATIC)

//if either token is MATIC
If token1 is MATIC, return actualProfit
If token0 is MATIC, call getGasVProfit(token1)

//if neither token is MATIC, look for a MATIC pair on all factories, then if that fails, look for a gasToken pair on all factories
If neither token0 or token1 are MATIC, call getPair(token1, MATIC) on all uniswapFactories
    If getPair(token1, MATIC) returns a valid pair, call getGasVProfit(token1)
    If getPair(token1, MATIC) returns an invalid pair address, call getPair(token1, gasToken) on all uniswapFactories
    If getPair(token1, gasToken) returns an invalid pair address, getPair(token0, MATIC)
        if getPair(token0, MATIC) returns a valid pair, call getAmountsOut(amountIn, token0, MATIC) and return the amountOut in MATIC
        if getPair(token0, MATIC) returns an invalid pair address, call getPair(token0, gasToken) on all uniswapFactories
            if getPair(token0, gasToken) returns an invalid pair address, return 0
            if getPair(token0, gasToken) returns a valid pair, call getAmountsOut(amountIn, token0, gasToken), then call getAmountsOut(amountIn, gasToken, MATIC) and return the amountOut in MATIC
    If getPair(token1, gasToken) returns a pair, gasTokenOut = await getAmountsOut(token1, gasToken), then await getAmountsOut(gasTokeOut, MATIC) and return the amountOut in MATIC
//if either token matches a gasToken
If token1 matches a gasToken, call getGasVProfit(token1)
    else if token0 matches a gasToken, call getAmountsOut(amountIn, token0, MATIC)

```
