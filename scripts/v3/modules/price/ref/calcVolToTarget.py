from web3 import Web3
from collections import namedtuple
# amount of x in range; sp - sqrt of current price, sb - sqrt of max price
def x_in_range(L, sp, sb):
    return L * (sb - sp) / (sp * sb)

# amount of y in range; sp - sqrt of current price, sa - sqrt of min price
def y_in_range(L, sp, sa):
    return L * (sp - sa)

def tick_to_price(tick):
    return 1.0001 ** tick

Tick = namedtuple("Tick", "liquidityGross liquidityNet feeGrowthOutside0X128 feeGrowthOutside1X128 tickCumulativeOutside secondsPerLiquidityOutsideX128 secondsOutside initialized")

# how much of X or Y tokens we need to *buy* to get to the target price?
deltaTokens = 0

if sPriceTarget > sPriceCurrent:
    # too few Y in the pool; we need to buy some X to increase amount of Y in pool
    while sPriceTarget > sPriceCurrent:
        if sPriceTarget > sPriceUpper:
            # not in the current price range; use all X in the range
            x = x_in_range(liquidity, sPriceCurrent, sPriceUpper)
            deltaTokens += x
            # query the blockchain for liquidity in the next tick range
            nextTickRange = Tick(*contract.functions.ticks(tickUpper).call())
            liquidity += nextTickRange.liquidityNet
            # adjust the price and the range limits
            sPriceCurrent = sPriceUpper
            tickLower = tickUpper
            tickUpper += tickSpacing
            sPriceLower = sPriceUpper
            sPriceUpper = tick_to_price(tickUpper // 2)
        else:
            # in the current price range
            x = x_in_range(liquidity, sPriceCurrent, sPriceTarget)
            deltaTokens += x
            sPriceCurrent = sPriceTarget
    print("need to buy {:.10f} X tokens".format(deltaTokens / 10 ** decimalsX))

elif sPriceTarget < sPriceCurrent:
    # too much Y in the pool; we need to buy some Y to decrease amount of Y in pool
    currentTickRange = None
    while sPriceTarget < sPriceCurrent:
        if sPriceTarget < sPriceLower:
            # not in the current price range; use all Y in the range
            y = y_in_range(liquidity, sPriceCurrent, sPriceLower)
            deltaTokens += y
            if currentTickRange is None:
                # query the blockchain for liquidityNet in the *current* tick range
                currentTickRange = Tick(*contract.functions.ticks(tickLower).call())
            liquidity -= currentTickRange.liquidityNet
            # adjust the price and the range limits
            sPriceCurrent = sPriceLower
            tickUpper = tickLower
            tickLower -= tickSpacing
            sPriceUpper = sPriceLower
            sPriceLower = tick_to_price(tickLower // 2)
            # query the blockchain for liquidityNet in new current tick range
            currentTickRange = Tick(*contract.functions.ticks(tickLower).call())
        else:
            # in the current price range
            y = y_in_range(liquidity, sPriceCurrent, sPriceTarget)
            deltaTokens += y
            sPriceCurrent = sPriceTarget
    print("need to buy {:.10f} Y tokens".format(deltaTokens / 10 ** decimalsY))


	
			let currentTickRange: ITick = {
				liquidityGross: 0n,
				liquidityNet: 0n,
				feeGrowthOutside0X128: 0n,
				feeGrowthOutside1X128: 0n,
				tickCumulativeOutside: 0n,
				secondsPerLiquidityOutsideX128: 0n,
				secondsOutside: 0n,
				initialized: false
			}

			let ATick = {
				liquidityTotal: 0n,
				liquidityDelta: 0n,
				outerFeeGrowth0Token: 0n,
				outerFeeGrowth1Token: 0n,
				prevTick: 0n,
				nextTick: 0n,
				outerSecondsPerLiquidity: 0n,
				outerSecondsSpent: 0n,
				hasLimitOrders: false,

			}