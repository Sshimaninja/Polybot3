import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { getTradeSize } from './lowslipBN';
import { Pair, ReservesData } from "../../../constants/interfaces";
import { Prices } from "./prices";
import { Token, Amounts } from "../../../constants/interfaces";
import { getAmountsOut, getAmountsIn } from './getAmountsIOLocal';
import { HiLo, Difference } from "../../../constants/interfaces";

/**
 * @description
 * This class holds amounts in/out for a pair, as well as the trade size.
 */
export class AmountCalculator {
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

	async getMaxTokenIn(): Promise<BigNumber> {
		const targetPrice = this.reserves.reserveOutBN.div(this.reserves.reserveInBN);
		const maxTokenIn = await getTradeSize(this.reserves.reserveInBN, this.reserves.reserveOutBN, targetPrice, this.slip);
		const maxIn = utils.parseUnits(maxTokenIn.toFixed(this.token0.decimals), this.token0.decimals!);
		return maxIn;
	}

	async getMaxTokenOut(): Promise<BigNumber> {
		const targetPrice = this.reserves.reserveInBN.div(this.reserves.reserveOutBN);
		const maxTokenPit = await getTradeSize(this.reserves.reserveOutBN, this.reserves.reserveInBN, targetPrice, this.slip);
		const maxOut = utils.parseUnits(maxTokenPit.toFixed(this.token1.decimals), this.token1.decimals!);
		return maxOut;
	}

	async getAmounts() {
		const maxIn = await this.getMaxTokenIn();
		const maxOut = await this.getMaxTokenOut();
		return { maxIn, maxOut };
	}
}