import { BigNumber as BN } from "bignumber.js";
import { PoolState } from "../../../constants/interfaces";
import { Contract } from "ethers";
/**
 * 
 * @param targetPrice 
 * @param currentPrice 
 * @param liq 
 * @returns amount of token0 needed to reach targetPrice
 */


export class TradeMath {
	pool: Contract// - the pool's contract
	sCurrentPrice: bigint// - sqrt of the current price
	sPriceTarget: bigint// - sqrt of the target price
	liquidity: bigint// - the liquidity in the current tick range of the pool
	tickLower: bigint// tickUpper - the min and max ticks of the current tick range
	sPriceUpper: bigint// sPriceUpper - square roots of prices corresponding to the min and max ticks of the current range
	tickSpacing: bigint// - the tick spacing in the pool.
	decimalsIn: number// 
	decimalsOut: number// - the number of decimals of the X and Y tokens, for printing the result

	constructor(
		pool: Contract,

		sCurrentPrice: bigint,
		sPriceTarget: bigint,
		liquidity: bigint,
		tickLower: bigint,
		sPriceUpper: bigint,
		tickSpacing: bigint,
		decimalsIn: number,
		decimalsOut: number,
	) {
		this.pool = pool;
		this.sCurrentPrice = sCurrentPrice;
		this.sPriceTarget = sPriceTarget;
		this.liquidity = liquidity;
		this.tickLower = tickLower;
		this.sPriceUpper = sPriceUpper;
		this.tickSpacing = tickSpacing;
		this.decimalsIn = decimalsIn;
		this.decimalsOut = decimalsOut;
	}
	/*
	TODO: Update this with info from the following articls:
	https://ethereum.stackexchange.com/questions/120828/uniswap-v3-calculate-volume-to-reach-target-price
	*/


	async tradeToPrice(targetPrice: BN, currentPrice: BN, liq: BN): Promise<BN> {
		const priceDiff = targetPrice.minus(currentPrice);
		const amountIn = priceDiff.multipliedBy(liq);
		if (targetPrice.lte(currentPrice)) {
			console.log("targetPrice lt currentPrice, returning 0")
			return new BN(0);
		} else {
			return amountIn;
		};
	}

	async sqrt(x: BN) {
		let z = new BN(x.plus(new BN(2).pow(96)).div(2).toFixed());
		let y = x;
		while (z.minus(y).isGreaterThan(0)) {
			y = z;
			z = x.div(z).plus(z).div(2);
		}
		return y;
	}
}