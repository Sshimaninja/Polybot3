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
 */
export class AmountConverter {
	token0: Token;
	token1: Token;
	reserves: ReservesData;
	targetPrice: BN;
	slip: BN;

	constructor(price: Prices, pair: Pair, targetPrice: BN, slippageTolerance: BN) {
		this.reserves = price.reserves;
		this.slip = slippageTolerance
		this.targetPrice = targetPrice;
		this.token0 = pair.token0;
		this.token1 = pair.token1;
	}

	async tradeToPrice(): Promise<BigNumber> {
		const tradeSize = await tradeToPrice(this.reserves.reserveInBN, this.reserves.reserveOutBN, this.targetPrice, this.slip);
		const tradeSizeJS = utils.parseUnits(tradeSize.toFixed(this.token0.decimals), this.token0.decimals!);
		return tradeSizeJS;
	}

	async getMaxTokenIn(): Promise<BigNumber> {
		const maxTokenIn = await getMaxTokenIn(this.reserves.reserveInBN, this.reserves.reserveOutBN, this.slip);
		const maxIn = utils.parseUnits(maxTokenIn.toFixed(this.token0.decimals), this.token0.decimals!);
		return maxIn;
	}

	async getMaxTokenOut(): Promise<BigNumber> {
		const maxTokenOut = await getMaxTokenOut(this.reserves.reserveOutBN, this.slip);
		const maxOut = utils.parseUnits(maxTokenOut.toFixed(this.token1.decimals), this.token1.decimals!);
		return maxOut;
	}

	async getAmounts() {
		const maxIn = await this.getMaxTokenIn();
		const maxOut = await this.getMaxTokenOut();
		const toPrice = await this.tradeToPrice();
		return { maxIn, maxOut, toPrice };
	}
}