import { BigNumber } from "ethers";
import { Bool3Trade, K, PoolState } from "../../../constants/interfaces";
import { AmountConverter } from "./amountConverter"
import { BN2JS } from "../../modules/convertBN";
import { V3Quote } from "./V3Quote2";

/**
 * This doc calculates whether will revert due to uniswak K being positive or negative
 * Uni V2 price formula: X * Y = K
 * @param 
 * @returns Uniswap K before and after  and whether it is positive or negative
 */

export async function getK(trade: Bool3Trade, state: PoolState, calc: AmountConverter, q: V3Quote): Promise<K> {

	const tl = trade.loanPool;
	const tt = trade.target;

	let kalc = {
		uniswapKPre: BigNumber.from(0),
		uniswapKPost: BigNumber.from(0),
		uniswapKPositive: false,
	}
	const tradeSizewithFee = await calc.addFee(tt.tradeSize);
	const newreservesIn = tl.state.reservesIn.mul(1000).sub(tt.tradeSize.mul(1000));
	// console.log("newreservesIn: ", newreservesIn.toString())
	if (newreservesIn.lte(0)) {
		return kalc;
	}

	const tradeSizeInTokenOut = await q.minIn(
		tradeSizewithFee,
	);

	// const tokenOutPrice = BN2JS(calc.price.priceOutBN, calc.token1.decimals);
	// // console.log("TradeSize: " + tradeSize.toString() + " * tokenOutPrice: " + tokenOutPrice.toString() + " = " + tokenOutPrice.mul(tradeSize).toString())
	// const tradeSizeInTermsOfTokenOut = tradeSize.mul(tokenOutPrice);
	// // console.log('tradeSizeInTermsOfTokenOut: ', tradeSizeInTermsOfTokenOut.toString())
	// const tradeSizeInTermsOfTokenOutWithFee = await calc.addFee(tradeSizeInTermsOfTokenOut);
	// // console.log('tradeSizeInTermsOfTokenOutWithFee: ', tradeSizeInTermsOfTokenOutWithFee.toString())

	kalc = trade.type === "multi" ? {
		uniswapKPre:
			// 1000 * 2000 = 2000000 
			tl.state.reservesIn.mul(tl.state.reservesOut),
		uniswapKPost:
			// 200000 = 1800 * 110
			//subtract loan: 
			tl.state.reservesIn.sub(tt.tradeSize)
				// multiply new reservesIn by new reservesOut by adding tradeSizeInTermsOfTokenOut
				.mul(tl.state.reservesOut.add(tradeSizeInTokenOut)),
		uniswapKPositive: false,
	} : trade.type === "direct" ? {
		uniswapKPre: tl.state.reservesIn.mul(tl.state.reservesOut),
		uniswapKPost:
			// reservesIn + tradeSizewithFee * reservesOut(unchanged)
			tl.state.reservesIn.add(tradeSizewithFee).mul(tl.state.reservesOut),
		uniswapKPositive: false,
	} : {
		uniswapKPre: BigNumber.from(0),
		uniswapKPost: BigNumber.from(0),
		uniswapKPositive: false,
	}

	kalc.uniswapKPositive = kalc.uniswapKPre.lt(kalc.uniswapKPost) ? true : false;
	return kalc;

}

