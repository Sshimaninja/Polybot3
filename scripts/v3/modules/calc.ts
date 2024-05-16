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


export async function subSlippage(amountOut: bigint, decimals: number): Promise<bigint> {
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
export async function addFee(amount: bigint): Promise<bigint> {
	//ALTERNATVE:

	// const repay = amount.mul(1003009027).div(1000000000);
	const repay = (amount * 1003n) / 1000n; // 0.3% fee (997/1000)
	// 167 * 1003 / 1000 =
	//167 * 997 / 1000 = 166
	// ex 100000 * 1003009027 / 1000000000 = 100301
	return repay; //in tokenIn
}

