import { IRL, InRangeLiquidity, V3Reserves } from '../inRangeLiquidity';
import { LiquidityMath, Pool, SwapMath, TickMath } from "@uniswap/v3-sdk";
import { ERC20token, PoolInfo, PoolStateV3, Slot0 } from '../../../../../constants/interfaces';
import { ethers } from 'ethers';
import JSBI from '/root/polybotv3/node_modules/@uniswap/sdk-core/node_modules/jsbi/jsbi';
import { Contract } from 'alchemy-sdk';

// //  amount of x in range; sp = sqrt of current price, sb = sqrt of max price
// def x_in_range(L, sp, sb):
// return L * (sb - sp) / (sp * sb)

// //  amount of y in range; sp = sqrt of current price, sa = sqrt of min price
// def y_in_range(L, sp, sa):
// return L * (sp - sa)

// def tick_to_price(tick):
// return 1.0001 ** tick
export interface Tick {
	liquidityGross: bigint
	liquidityNet: bigint
	feeGrowthOutside0X128: bigint
	feeGrowthOutside1X128: bigint
	tickCumulativeOutside: bigint
	secondsPerLiquidityOutsideX128: bigint
	secondsOutside: bigint
	initialized: boolean
}

export async function volToTarget(
	token0: ERC20token,
	token1: ERC20token,
	pool: Contract,
	s: IRL,
	sPriceTarget: number,
) {

	//  amount of x in range; 
	// sp = sPriceCurrent, sb = sPriceUpper
	async function x_in_range(L: number, sp: number, sb: number) {
		return L * (sb - sp) / (sp * sb)
	}

	//  amount of y in range; 
	// sp = sPriceCurrent, sa = sPriceLower
	async function y_in_range(L: number, sp: number, sa: number) {
		return L * (sp - sa)
	}

	async function tick_to_price(tick: number) {
		return 1.0001 ** tick
	}

	let sPriceCurrent = s.sqrtPrice
	let sPriceLower = s.sqrtRatioLow
	let sPriceUpper = s.sqrtRatioHigh
	let liquidity = Number(s.liquidity)

	let Tick = {
		liquidityGross: 0,
		liquidityNet: 0,
		feeGrowthOutside0X128: 0,
		feeGrowthOutside1X128: 0,
		tickCumulativeOutside: 0,
		secondsPerLiquidityOutsideX128: 0,
		secondsOutside: 0,
		initialized: false
	}

	// //  how much of X or Y tokens we need to * buy * to get to the target price ?
	let deltaTokens = 0
	let x = 0
	if (sPriceTarget > sPriceCurrent) {
		//  too few Y in the pool; we need to buy some X to increase amount of Y in pool
		while (sPriceTarget > sPriceCurrent) {
			if (sPriceTarget > sPriceUpper)
				//  not in the current price range; use all X in the range
				x = await x_in_range(liquidity, sPriceCurrent, sPriceUpper)
		}
	}
	deltaTokens += x
	//  query the blockchain for liquidity in the next tick range
	let nextTickRange = Tick(* contract.functions.ticks(tickUpper).call())
	liquidity += nextTickRange.liquidityNet
	//  adjust the price and the range limits
	sPriceCurrent = sPriceUpper
	tickLower = tickUpper
	tickUpper += tickSpacing
	sPriceLower = sPriceUpper
	sPriceUpper = tick_to_price(tickUpper // 2)
        else:
		//  in the current price range
		x = x_in_range(liquidity, sPriceCurrent, sPriceTarget)
            deltaTokens += x
            sPriceCurrent = sPriceTarget
    print("need to buy {:.10f} X tokens".format(deltaTokens / 10 ** decimalsX))

elif sPriceTarget < sPriceCurrent:
		//  too much Y in the pool; we need to buy some Y to decrease amount of Y in pool
		currentTickRange = None
	while sPriceTarget < sPriceCurrent:
		if sPriceTarget < sPriceLower:
			//  not in the current price range; use all Y in the range
			y = y_in_range(liquidity, sPriceCurrent, sPriceLower)
	deltaTokens += y
	if currentTickRange is None:
	//  query the blockchain for liquidityNet in the * current * tick range
	currentTickRange = Tick(* contract.functions.ticks(tickLower).call())
	liquidity -= currentTickRange.liquidityNet
	//  adjust the price and the range limits
	sPriceCurrent = sPriceLower
	tickUpper = tickLower
	tickLower -= tickSpacing
	sPriceUpper = sPriceLower
	sPriceLower = tick_to_price(tickLower // 2)
            //  query the blockchain for liquidityNet in new current tick range
	currentTickRange = Tick(* contract.functions.ticks(tickLower).call())
        else:
		//  in the current price range
		y = y_in_range(liquidity, sPriceCurrent, sPriceTarget)
	deltaTokens += y
	sPriceCurrent = sPriceTarget
	print("need to buy {:.10f} Y tokens".format(deltaTokens / 10 ** decimalsY))
}