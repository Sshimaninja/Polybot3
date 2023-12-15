import { BigNumber } from "ethers";
import { Bool3Trade, K, PoolState } from "../../../constants/interfaces";
import { AmountConverter } from "./amountConverter"
import { BN2JS } from "../../modules/convertBN";
import { V3Quote } from "./v3Quote";

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
	const newReserveIn = tl.state.reserveIn.mul(1000).sub(tt.tradeSize.mul(1000));
	// console.log("newReserveIn: ", newReserveIn.toString())
	if (newReserveIn.lte(0)) {
		return kalc;
	}

	const tradeSizeInTokenOut = await q.getAmountInMin(
		tl.exchange,
		tl.protocol,
		tl.feeTier,
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
			tl.state.reserveIn.mul(tl.state.reserveOut),
		uniswapKPost:
			// 200000 = 1800 * 110
			//subtract loan: 
			tl.state.reserveIn.sub(tt.tradeSize)
				// multiply new reserveIn by new reservesOut by adding tradeSizeInTermsOfTokenOut
				.mul(tl.state.reserveOut.add(tradeSizeInTokenOut)),
		uniswapKPositive: false,
	} : trade.type === "direct" ? {
		uniswapKPre: tl.state.reserveIn.mul(tl.state.reserveOut),
		uniswapKPost:
			// reserveIn + tradeSizewithFee * reserveOut(unchanged)
			tl.state.reserveIn.add(tradeSizewithFee).mul(tl.state.reserveOut),
		uniswapKPositive: false,
	} : {
		uniswapKPre: BigNumber.from(0),
		uniswapKPost: BigNumber.from(0),
		uniswapKPositive: false,
	}

	kalc.uniswapKPositive = kalc.uniswapKPre.lt(kalc.uniswapKPost) ? true : false;
	return kalc;

}

