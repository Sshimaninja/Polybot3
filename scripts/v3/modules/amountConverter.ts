import { BigNumber, Contract, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { getMaxTokenIn, getMaxTokenOut, tradeToPrice } from './tradeMath';
import { Match3Pools, Pair, PoolState } from "../../../constants/interfaces";
import { Token } from "../../../constants/interfaces";

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
	async tradeToPrice(): Promise<BigNumber> {
		this.targetPrice = this.state.priceOutBN.plus(this.targetPrice).div(2);// average of two prices
		const tradeSize = await tradeToPrice(this.state, this.targetPrice, this.slip);
		// console.log('tradeSize: ', tradeSize.toFixed(this.match.token0.decimals));//DEBUG
		const tradeSizeJS = utils.parseUnits(tradeSize.toFixed(this.match.token0.decimals), this.match.token0.decimals);
		// console.log('tradeSizeJS: ', utils.formatUnits(tradeSizeJS, this.match.token0.decimals));//DEBUG
		return tradeSizeJS;
	}

	async getMaxTokenIn(): Promise<BigNumber> {
		const maxTokenIn = await getMaxTokenIn(this.state.reserveInBN, this.slip);
		// console.log('maxTokenIn: ', maxTokenIn.toFixed(this.match.token0.decimals));//DEBUG
		const maxIn = utils.parseUnits(maxTokenIn.toFixed(this.match.token0.decimals), this.match.token0.decimals!);
		return maxIn;
	}

	async getMaxTokenOut(): Promise<BigNumber> {
		const maxTokenOut = await getMaxTokenOut(this.state.reserveOutBN, this.slip);
		const maxOut = utils.parseUnits(maxTokenOut.toFixed(this.match.token1.decimals), this.match.token1.decimals!);
		return maxOut;
	}

	// Adds Uniswap V3 trade fee to any amount
	async addFee(amount: BigNumber): Promise<BigNumber> {
		const feeFactor = BigNumber.from(1).add(this.fee).div(100000); // Convert fee to a factor
		const repay = amount.mul(feeFactor.mul(1000)).div(1000); // Apply fee
		return repay; //in token0
	}

	// // Adds slippage to any amount
	// async addSlippage(amount: BigNumber): Promise<BigNumber> {
	// 	const slippageFactor = BigNumber.from(1).add(this.slip).div(100000); // Convert slippage to a factor
	// 	const amountWithSlippage = amount.mul(slippageFactor.mul(1000)).div(1000); // Apply slippage
	// 	return amountWithSlippage; //in token0
	// }

	async getAmounts() {
		const maxIn = await this.getMaxTokenIn();
		const maxOut = await this.getMaxTokenOut();
		return { maxIn, maxOut };
	}
}