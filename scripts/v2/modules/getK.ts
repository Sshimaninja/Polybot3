import { BigInt } from "ethers";
import { K } from "../../../constants/interfaces";
import { AmountConverter } from "./amountConverter"
import { BN2JS } from "../../modules/convertBN";
import { getAmountsInJS } from "./getAmountsIOLocal";

/**
 * This doc calculates whether will revert due to uniswak K being positive or negative
 * Uni V2 price formula: X * Y = K
 * @param 
 * @returns Uniswap K before and after  and whether it is positive or negative
 */

export async function getK(type: string, tradeSize: bigint, reserveIn: bigint, reserveOut: bigint, calc: AmountConverter): Promise<K> {

	let kalc = {
		uniswapKPre: 0n,
		uniswapKPost: 0n,
		uniswapKPositive: false,
	}
	const tradeSizewithFee = await calc.addFee(tradeSize);
	const newReserveIn = reserveIn.mul(1000).sub(tradeSize.mul(1000));
	// console.log("newReserveIn: ", newReserveIn.toString())
	if (newReserveIn.lte(0)) {
		return kalc;
	}

	const tradeSizeInTokenOut = await getAmountsInJS(tradeSize, reserveOut, reserveIn);

	// const tokenOutPrice = BN2JS(calc.price.priceOutBN, calc.token1.decimals);
	// // console.log("TradeSize: " + tradeSize.toString() + " * tokenOutPrice: " + tokenOutPrice.toString() + " = " + tokenOutPrice.mul(tradeSize).toString())
	// const tradeSizeInTermsOfTokenOut = tradeSize.mul(tokenOutPrice);
	// // console.log('tradeSizeInTermsOfTokenOut: ', tradeSizeInTermsOfTokenOut.toString())
	// const tradeSizeInTermsOfTokenOutWithFee = await calc.addFee(tradeSizeInTermsOfTokenOut);
	// // console.log('tradeSizeInTermsOfTokenOutWithFee: ', tradeSizeInTermsOfTokenOutWithFee.toString())

	kalc = type === "multi" ? {
		uniswapKPre:
			// 1000 * 2000 = 2000000 
			reserveIn.mul(reserveOut),
		uniswapKPost:
			// 200000 = 1800 * 110
			//subtract loan: 
			reserveIn.sub(tradeSize)
				// multiply new reserveIn by new reservesOut by adding tradeSizeInTermsOfTokenOut
				.mul(reserveOut.add(tradeSizeInTokenOut)),
		uniswapKPositive: false,
	} : type === "direct" ? {
		uniswapKPre: reserveIn.mul(reserveOut),
		uniswapKPost:
			// reserveIn + tradeSizewithFee * reserveOut(unchanged)
			reserveIn.add(tradeSizewithFee).mul(reserveOut),
		uniswapKPositive: false,
	} : {
		uniswapKPre: 0n,
		uniswapKPost: 0n,
		uniswapKPositive: false,
	}

	kalc.uniswapKPositive = kalc.uniswapKPre.lt(kalc.uniswapKPost) ? true : false;
	return kalc;

}

