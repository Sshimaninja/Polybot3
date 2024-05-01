import { BigNumber as BN } from "bignumber.js";
import {
	Bool3Trade,
	// Pair,
	// ReservesData,
	Sizes,
	// TradePair,
} from "../../../constants/interfaces";
// import { Prices } from "./Prices";
// import { Token, Amounts } from "../../../constants/interfaces";
import { BigInt2BN, fu, pu } from "../../modules/convertBN";
import { slip } from "../../../constants/environment";

/**
 * @description
 * This class holds amounts in/out for a pair, as well as the trade size.
 * target pricestarget is re-intitialized as the average of two pricestargets.
 */

export class AmountConverter {
	trade: Bool3Trade;
	tradeSizes: Sizes;

	constructor(trade: Bool3Trade) {
		this.tradeSizes = {
			loanPool: {
				tradeSizeTokenIn: { size: 0n },
				// tradeSizeTokenIn: { size: 0n, sizeBN: BN(0) },
			},
			target: {
				tradeSizeTokenOut: { size: 0n },
				// tradeSizeTokenOut: { size: 0n, sizeBN: BN(0) },
			},
		};
		this.trade = trade;
	}

	/**
	 * @returns Amounts in/out for a trade. Should never be negative.
	 */
	// tradeToPrice gets a mid-level between pricestarget of pool and target pricestarget, and returns the amount of tokenIn needed to reach that pricestarget
	// can be limited by slip if uniswap returns 'EXCESSIVE_INPUT_AMOUNT'
	// can be limited by max0Intarget if uniswap returns 'INSUFFICIENT_INPUT_AMOUNT'

	async tradeToPrice(): Promise<Sizes> {
		let tradeSizes: Sizes = {
			loanPool: {
				tradeSizeTokenIn: { size: 0n },
				// tradeSizeTokenIn: { size: 0n, sizeBN: BN(0) },
			},
			target: {
				tradeSizeTokenOut: { size: 0n },
				// tradeSizeTokenOut: { size: 0n, sizeBN: BN(0) },
			},
		};


		return tradeSizes;
	}

	async getMaxTokenInIOtarget(): Promise<void> {

	}

	async getMaxTokenOutIOtarget(): Promise<void> {

	}

	async getMaxTokenInIOloanPool(): Promise<void> {

	}
	async getMaxTokenOutIOloanPool(): Promise<void> {

	}

	async subSlippage(amountOut: bigint, decimals: number): Promise<bigint> {
		const amount = BigInt2BN(amountOut, decimals);
		const slippage = amount.times(slip);
		const adjAmountBN = amount.minus(slippage);
		const adjAmountJS = pu(adjAmountBN.toFixed(decimals), decimals);
		// 12000 * 0.005 = 60
		// 12000 - 60 = 11940
		//
		return adjAmountJS;
	}

	// Adds Uniswap V2 trade fee to any amount
	async addFee(amount: bigint): Promise<bigint> {
		//ALTERNATVE:

		// const repay = amount.mul(1003009027).div(1000000000);
		const repay = (amount * 1003n) / 1000n; // 0.3% fee (997/1000)
		// 167 * 1003 / 1000 =
		//167 * 997 / 1000 = 166
		// ex 100000 * 1003009027 / 1000000000 = 100301
		return repay; //in tokenIn
	}

	async getSize(): Promise<Sizes> {
		let p = await this.tradeToPrice();

		const sizetargetTokenOut = async (): Promise<bigint> => {
			return 0n;
		};

		const sizeloanPoolTokenIn = async (): Promise<bigint> => {
			const toPrice0 = p.loanPool.tradeSizeTokenIn.size;
			if (toPrice0 === 0n) {
				return 0n;
			}


			return 0n;
		};

		p = {
			loanPool: {
				tradeSizeTokenIn: {
					size: await sizeloanPoolTokenIn(),
					// sizeBN: await size0BN(),
				},
			},
			target: {
				tradeSizeTokenOut: {
					size: await sizetargetTokenOut(),
					// sizeBN: await size1BN(),
				},
			},
		};

		// console.log("[AmountConverter]: ", tradeSizes);
		return p;
	}
}
