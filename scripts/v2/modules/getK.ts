import { BigNumber } from "ethers";
import { K } from "../../../constants/interfaces";
import { AmountConverter } from "./amountConverter"
import { BN2JS } from "./convertBN";

/**
 * This doc calculates whether will revert due to uniswak K being positive or negative
 * Uni V2 price formula: X * Y = K
 * @param 
 * @returns Uniswap K before and after  and whether it is positive or negative
 */

export async function getK(type: string, tradeSize: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber, calc: AmountConverter): Promise<K> {
	let kalc = {
		uniswapKPre: BigNumber.from(0),
		uniswapKPost: BigNumber.from(0),
		uniswapKPositive: false,
	}
	const tradeSizewithFee = await calc.addFee(tradeSize);
	const newReserveIn = reserveIn.mul(1000).sub(tradeSize.mul(1000));
	// console.log("newReserveIn: ", newReserveIn.toString())
	if (newReserveIn.lte(0)) {
		return kalc;
	}
	const tokenOutPrice = BN2JS(calc.price.priceOutBN, calc.token1.decimals);
	// console.log("TradeSize: " + tradeSize.toString() + " * tokenOutPrice: " + tokenOutPrice.toString() + " = " + tokenOutPrice.mul(tradeSize).toString())
	const tradeSizeInTermsOfTokenOut = tradeSize.mul(tokenOutPrice);
	// console.log('tradeSizeInTermsOfTokenOut: ', tradeSizeInTermsOfTokenOut.toString())
	const tradeSizeInTermsOfTokenOutWithFee = await calc.addFee(tradeSizeInTermsOfTokenOut);
	// console.log('tradeSizeInTermsOfTokenOutWithFee: ', tradeSizeInTermsOfTokenOutWithFee.toString())
	if (type === "multi") {
		kalc = {
			uniswapKPre:
				// 1000 * 2000 = 2000000 
				reserveIn.mul(reserveOut),
			uniswapKPost:
				// 200000 = 1800 * 110
				//subtract loan: 
				reserveIn.sub(tradeSize)
					// multiply new reserveIn by new reservesOut by adding tradeSizeInTermsOfTokenOut
					.mul(reserveOut.add(tradeSizeInTermsOfTokenOutWithFee)),
			uniswapKPositive: false,
		}
	}
	if (type === "direct") {
		kalc = {
			uniswapKPre: reserveIn.mul(reserveOut),
			uniswapKPost:
				// reserveIn + tradeSizewithFee * reserveOut(unchanged)
				reserveIn.add(tradeSizewithFee).mul(reserveOut),
			uniswapKPositive: false,
		}
	} else {
		kalc = {
			uniswapKPre: BigNumber.from(0),
			uniswapKPost: BigNumber.from(0),
			uniswapKPositive: false,
		}
	}
	if (kalc.uniswapKPre.lt(kalc.uniswapKPost)) {
		kalc.uniswapKPositive = true;
	}
	return kalc;
}
