import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { getMaxTokenIn, getMaxTokenOut, tradeToPrice } from './tradeMath';
import { Pair, ReservesData } from "../../../constants/interfaces";
import { Prices } from "./prices";
import { Token, Amounts } from "../../../constants/interfaces";
import { getAmountsOut, getAmountsIn } from './getAmountsIOLocal';
import { HiLo, Difference } from "../../../constants/interfaces";

/**
 * @description
 * This class holds amounts in/out for a pair, as well as the trade size.
 * Target price is re-intitialized as the average of two prices.
 */
export class AmountConverter {
	token0: Token;
	token1: Token;
	reserves: ReservesData;
	price: Prices;
	targetPrice: BN;
	slip: BN;

	constructor(price: Prices, pair: Pair, targetPrice: BN, slippageTolerance: BN) {
		this.reserves = price.reserves;
		this.price = price
		this.targetPrice = targetPrice;
		this.slip = slippageTolerance
		this.token0 = pair.token0;
		this.token1 = pair.token1;
	}

	/**
	 * @returns Amounts in/out for a trade. Should never be negative.
	 */
	async tradeToPrice(): Promise<BigNumber> {
		this.targetPrice = this.price.priceOutBN.plus(this.targetPrice).div(2);// average of two prices
		const tradeSize = await tradeToPrice(this.reserves.reserveInBN, this.reserves.reserveOutBN, this.targetPrice, this.slip);
		// console.log('tradeSize: ', tradeSize.toFixed(this.token0.decimals));//DEBUG
		const tradeSizeJS = utils.parseUnits(tradeSize.toFixed(this.token0.decimals), this.token0.decimals);
		// console.log('tradeSizeJS: ', utils.formatUnits(tradeSizeJS, this.token0.decimals));//DEBUG
		return tradeSizeJS;
	}

	async getMaxTokenIn(): Promise<BigNumber> {
		const maxTokenIn = await getMaxTokenIn(this.reserves.reserveInBN, this.reserves.reserveOutBN, this.slip);
		const maxIn = utils.parseUnits(maxTokenIn.toFixed(this.token0.decimals), this.token0.decimals!);
		return maxIn;
	}

	async getMaxTokenOut(): Promise<BigNumber> {
		const maxTokenOut = await getMaxTokenOut(this.reserves.reserveInBN, this.reserves.reserveOutBN, this.slip);
		const maxOut = utils.parseUnits(maxTokenOut.toFixed(this.token1.decimals), this.token1.decimals!);
		return maxOut;
	}

	// Adds Uniswap V2 trade fee to any amount
	async addFee(amount: BigNumber): Promise<BigNumber> {
		const repay = amount.mul(1003009027).div(1000000000);
		// ex 100000 * 1003009027 / 1000000000 = 100301
		return repay; //in token0
	}

	async getAmounts() {
		const maxIn = await this.getMaxTokenIn();
		const maxOut = await this.getMaxTokenOut();
		return { maxIn, maxOut };
	}
}