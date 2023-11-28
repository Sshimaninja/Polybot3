import { BigNumber, BigNumberish } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Profcalcs, V3Repays, Bool3Trade } from "../../../constants/interfaces";
import { AmountConverter } from "./amountConverter";
import { V3Quote } from "./v3Quote";
import { JS2BN, BN2JS, fu, pu } from "../../modules/convertBN";


export class PopulateRepays {
	trade: Bool3Trade;
	calc: AmountConverter;
	q: V3Quote;
	constructor(trade: Bool3Trade, calc: AmountConverter, quote: V3Quote) {
		this.trade = trade;
		this.calc = calc;
		this.q = quote
	}

	async getMulti(): Promise<{ repays: V3Repays, profits: { profit: BigNumber, profitPercent: BN } }> {
		/*
		I have to send back only the amount of token1 needed to repay the amount of token0 I was loaned.
		Thus I need to calculate the exact amount of token1 that this.tradeSize in tokenOut represents on loanPool, 
		and subtract it from recipient.amountOut before sending it back
		*/
		// const postReserveIn = this.trade.loanPool.reserveIn.sub(this.trade.target.this.tradeSize); // I think this is only relevant for uniswap K calcs				
		const getRepay = async (): Promise<V3Repays> => {
			// const this.tradeSizeInTermsOfTokenOutOnLoanPool =
			// 	this.trade.target.this.tradeSize
			// 		.mul(this.trade.loanPool.reserveOut)
			// 		.div(this.trade.loanPool.reserveIn.add(this.trade.target.this.tradeSize)); // <= This is the amount of tokenOut that this.tradeSize in tokenOut represents on loanPool.
			// const simple = await calc.addFee(this.tradeSizeInTermsOfTokenOutOnLoanPool)

			const repayByGetAmountsOut = await this.q.getAmountOutMax(// getAmountsOut is used here, but you can also use getAmountsIn, as they can achieve similar results by switching reserves.
				this.trade.loanPool.exchange,
				this.trade.loanPool.protocol,
				this.trade.loanPool.feeTier,
				this.trade.target.tradeSize,
				this.trade.loanPool.state.sqrtPriceX96,
			)
			const repayByGetAmountsIn = await this.q.getAmountInMin( //Will output tokenIn.
				this.trade.loanPool.exchange,
				this.trade.loanPool.protocol,
				this.trade.loanPool.feeTier,
				this.trade.target.tradeSize,
				this.trade.loanPool.state.sqrtPriceX96,
			)

			const repays: V3Repays = {
				getAmountsOut: repayByGetAmountsOut,
				getAmountsIn: repayByGetAmountsIn,
				repay: repayByGetAmountsIn,
			}

			// console.log("[populateRepays] repays: ", repays)

			return repays;
		}

		const repays = await getRepay();

		const getProfit = async (): Promise<Profcalcs> => {
			let repay = repays.repay;
			// this must be re-assigned to be accurate, if you re-assign this.trade.loanPool.amountRepay below. The correct amountRepay should be decided upon and this message should be removed.
			// if (repay.lt(this.trade.target.amountOut)) {
			let profit: Profcalcs = { profit: BigNumber.from(0), profitPercent: BN(0) };
			profit.profit = this.trade.target.amountOut.sub(repay);
			const profitBN = JS2BN(profit.profit, this.trade.tokenOut.decimals);
			profit.profitPercent = this.trade.target.amountOut.gt(0) ? profitBN.dividedBy(fu(this.trade.target.amountOut, this.trade.tokenOut.decimals)).multipliedBy(100) : BN(0);
			return profit;
			// } else {
			// 	return { profit: BigNumber.from(0), profitPercent: BN(0) };
			// }
		}

		const profits = await getProfit();
		// const postReserveOut = this.trade.loanPool.reserveOut.add(this.tradeSizeInTermsOfTokenOutWithFee);				
		return { repays, profits };
	}


	async getDirect(): Promise<{ repay: BigNumber, profit: BigNumber, percentProfit: BN }> {

		const repay = this.trade.target.tradeSize;//must add fee from pool v3 to this.

		const directRepayLoanPoolInTokenOut = await this.q.getAmountInMin(
			this.trade.loanPool.protocol,
			this.trade.loanPool.exchange,
			this.trade.loanPool.feeTier,
			repay,
			this.trade.loanPool.state.sqrtPriceX96,
		);
		const directRepayLoanPoolInTokenOutWithFee = await this.calc.addFee(directRepayLoanPoolInTokenOut);
		const profit = this.trade.target.amountOut.sub(directRepayLoanPoolInTokenOutWithFee); // profit is remainder of token1 out
		const profitBN = JS2BN(profit, this.trade.tokenOut.decimals);
		const percentProfit = this.trade.target.amountOut.gt(0) ? profitBN.dividedBy(fu(this.trade.target.amountOut, this.trade.tokenOut.decimals)).multipliedBy(100) : BN(0);
		return { repay, profit, percentProfit };
	}

}