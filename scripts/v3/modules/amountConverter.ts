import {  Contract } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { tradeToPrice } from './tradeMath';
import { Match3Pools, Pair, PoolState } from "../../../constants/interfaces";
import { Token } from "../../../constants/interfaces";
import { pu } from "../../modules/convertBN";

/**
 * @description
 * This class holds amounts in/out for a pair, as well as the trade size.
 * Target price is re-intitialized as the average of two prices.
 */
export class AmountConverter {
	match: Match3Pools;
	state: PoolState;
	targetPrice: BN;
	slip: BN;
	fee: number;
	constructor(match: Match3Pools, state: PoolState, targetPrice: BN, fee: number, slippageTolerance: BN) {
		this.match = match;
		this.state = state
		this.targetPrice = targetPrice;
		this.slip = slippageTolerance;
		this.fee = fee;

	}

	/**
	 * @returns Amounts in/out for a trade. Should never be negative.
	 */
	// tradeToPrice gets a mid-level between price of pool and target price, and returns the amount of token0 needed to reach that price
	// can be limited by slippageTolerance if uniswap returns 'EXCESSIVE_INPUT_AMOUNT'
	async tradeToPrice(): Promise<BigInt> {
		const avgPrice = this.state.priceOutBN.plus(this.targetPrice).div(2);// average of two prices
		const tradeSize = await tradeToPrice(this.state.priceOutBN, avgPrice, this.state.liquidityBN);
		const maxSize = tradeSize.times(this.slip)
		// console.log('tradeSize: ', tradeSize.toFixed(this.match.token0.decimals));//DEBUG
		const tradeSizeJS = pu(maxSize.toFixed(this.match.token0.decimals), this.match.token0.decimals);
		// console.log('tradeSizeJS: ', utils.formatUnits(tradeSizeJS, this.match.token0.decimals));//DEBUG
		return tradeSizeJS;
	}

	// Adds Uniswap V3 trade fee to any amount
	async addFee(amount: bigint): Promise<BigInt> {
		const feeFactor = 1n + BigInt(this.fee) / (100000n); // Convert fee to a factor
		const repay = amount * (feeFactor * (1000n))/(1000n); // Apply fee
		return repay; //in token0
	}

	// // Adds slippage to any amount
	// async addSlippage(amount: bigint): Promise<BigInt> {
	// 	const slippageFactor = BigInt.from(1).add(this.slip).div(100000); // Convert slippage to a factor
	// 	const amountWithSlippage = amount.mul(slippageFactor.mul(1000)).div(1000); // Apply slippage
	// 	return amountWithSlippage; //in token0
	// }

}