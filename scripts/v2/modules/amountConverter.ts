import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { getMaxTokenIn, getMaxTokenOut, tradeToPrice } from './tradeType';
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
	slip: BN;

	constructor(price: Prices, pair: Pair, slippageTolerance: BN) {
		this.reserves = price.reserves;
		this.slip = slippageTolerance
		this.token0 = pair.token0;
		this.token1 = pair.token1;
	}

	/**
	 * @returns Amounts in/out for a trade. Can be negative which means the trade needs to be reversed.
	 */
	async tradeToPrice(targetPrice: BN): Promise<BigNumber> {
		targetPrice = this.reserves.reserveOutBN.plus(targetPrice).div(2);// average of two prices
		const tradeSize = await tradeToPrice(this.reserves.reserveInBN, this.reserves.reserveOutBN, targetPrice, this.slip);
		const tradeSizeJS = utils.parseUnits(tradeSize.toFixed(this.token0.decimals), this.token0.decimals);
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

	async getAmounts() {
		const maxIn = await this.getMaxTokenIn();
		const maxOut = await this.getMaxTokenOut();
		return { maxIn, maxOut };
	}
}