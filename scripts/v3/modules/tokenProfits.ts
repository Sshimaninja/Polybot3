import { BigNumber as BN } from "bignumber.js";
import { Profcalcs, V3Repays, Bool3Trade } from "../../../constants/interfaces";
import { AmountConverter } from "./amountConverter";
import { V3Quote } from "./price/v3Quote";
import { BigInt2BN, BN2BigInt, fu, pu } from "../../modules/convertBN";
import { addFee } from "./calc";

export class TokenProfits {
	trade: Bool3Trade;
	q: V3Quote;
	constructor(trade: Bool3Trade, quote: V3Quote) {
		this.trade = trade;
		this.q = quote
	}

	async getMulti(): Promise<{ /*repay: V3Repays,*/ profits: { profit: bigint, profitPercent: BN } }> {
		/*
		I have to send back only the amount of token1 needed to repay the amount of token0 I was loaned.
		Thus I need to calculate the exact amount of token1 that this.tradeSize in tokenOut represents on loanPool, 
		and subtract it from recipient.amountOut before sending it back
		*/
		// const postReserveIn = this.trade.loanPool.reservesIn.sub(this.trade.target.this.tradeSize); // I think this is only relevant for uniswap K calcs				
		//const getRepay = async (): Promise<V3Repays> => {

		//	//const repayByGetAmountsOut = await this.q.maxOut(// getAmountsOut is used here, but you can also use getAmountsIn, as they can achieve similar results by switching reserves.
		//	//	this.trade.target.tradeSize
		//	//)
		//	const repayByGetAmountsIn = await this.q.minIn( //Will output tokenIn.
		//		this.trade.target.tradeSize
		//	)

		//	const repay: V3Repays = {
		//		//getAmountsOut: repayByGetAmountsOut.amountOut,
		//		//getAmountsIn: repayByGetAmountsIn.amountIn,
		//		repay: repayByGetAmountsIn.amountIn,
		//	}

		//	console.log("repay: ", repay)
		//	return repay;
		//}

		//const repay = await getRepay();

		const getProfit = async (): Promise<Profcalcs> => {

			// this must be re-assigned to be accurate, if you re-assign this.trade.loanPool.amountRepay below. The correct amountRepay should be decided upon and this message should be removed.
			// if (repay.lt(this.trade.target.amountOut)) {
			let profit: Profcalcs = { profit: 0n, profitPercent: BN(0) };
			profit.profit = this.trade.target.amountOut - this.trade.loanPool.amountRepay; //must add fee from pool v3 to this?
			const profitBN = BigInt2BN(profit.profit, this.trade.tokenOut.decimals);
			profit.profitPercent = this.trade.target.amountOut > (0) ? profitBN.dividedBy(fu(this.trade.target.amountOut, this.trade.tokenOut.decimals)).multipliedBy(100) : BN(0);
			return profit;
			// } else {
			// 	return { profit: 0n, profitPercent: BN(0) };
			// }
		}

		const profits = await getProfit();
		// const postReserveOut = this.trade.loanPool.reserveOut.add(this.tradeSizeInTermsOfTokenOutWithFee);				
		//console.log("repays: ", await getRepay(), " profits: ", profits)
		return { profits };
	}


	async getDirect(): Promise<{ repay: bigint, profit: bigint, percentProfit: BN }> {

		const repay = this.trade.target.tradeSize;//must add fee from pool v3 to this.

		const directRepayLoanPoolInTokenOut = await this.q.minIn(
			repay,
		);
		const directRepayLoanPoolInTokenOutWithFee = await addFee(directRepayLoanPoolInTokenOut.amountIn);
		const profit = this.trade.target.amountOut - (directRepayLoanPoolInTokenOutWithFee); // profit is remainder of token1 out
		const profitBN = BigInt2BN(profit, this.trade.tokenOut.decimals);
		const percentProfit = this.trade.target.amountOut > (0) ? profitBN.dividedBy(fu(this.trade.target.amountOut, this.trade.tokenOut.decimals)).multipliedBy(100) : BN(0);
		return { repay, profit, percentProfit };
	}

}