import { BigNumber, BigNumberish } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Profcalcs, Repays, BoolTrade } from "../../../constants/interfaces";
import { AmountConverter } from "./amountConverter";
import { getAmountsIn, getAmountsOut } from "./getAmountsIOLocal";
import { JS2BN, BN2JS, fu, pu } from "./convertBN";


export async function getMulti(trade: BoolTrade, calc: AmountConverter): Promise<{ repays: Repays, profits: { profit: BigNumber, profitPercent: BN } }> {
	/*
	I have to send back only the amount of token1 needed to repay the amount of token0 I was loaned.
	Thus I need to calculate the exact amount of token1 that tradeSize in tokenOut represents on loanPool, 
	and subtract it from recipient.amountOut before sending it back
	*/
	// const postReserveIn = trade.loanPool.reserveIn.sub(trade.target.tradeSize); // I think this is only relevant for uniswap K calcs				
	async function getRepay(): Promise<Repays> {
		const tradeSizeInTermsOfTokenOutOnLoanPool =
			trade.target.tradeSize.mul(trade.loanPool.reserveOut).div(trade.loanPool.reserveIn);
		const repayByGetAmountsOut = await getAmountsOut(// getAmountsOut is used here, but you can also use getAmountsIn, as they can achieve similar results by switching reserves.
			trade.target.tradeSize,
			trade.loanPool.reserveIn,
			trade.loanPool.reserveOut // <= Will return in terms of this reserve. If this is reserveIn, will return in terms of tokenIn. If this is reserveOut, will return in terms of tokenOut.
		)
		const repayByGetAmountsIn = await getAmountsIn( //Will output tokenIn.
			trade.target.tradeSize,
			trade.loanPool.reserveOut, // <= Will return in terms of this reserve. If this is reserveIn, will return in terms of tokenIn. If this is reserveOut, will return in terms of tokenOut.
			trade.loanPool.reserveIn
		)
		const simple = await calc.addFee(tradeSizeInTermsOfTokenOutOnLoanPool);
		const repays: Repays = {
			simpleMulti: simple,
			getAmountsOut: repayByGetAmountsOut,
			getAmountsIn: repayByGetAmountsIn,
			//SET YOUR CHOICE HERE:
			repay: repayByGetAmountsIn,
		}
		return repays;
	}

	const repays = await getRepay();

	async function getProfit(): Promise<Profcalcs> {
		let repay = repays.repay;
		// this must be re-assigned to be accurate, if you re-assign trade.loanPool.amountRepay below. The correct amountRepay should be decided upon and this message should be removed.
		// if (repay.lt(trade.target.amountOut)) {
		let profit: Profcalcs = { profit: BigNumber.from(0), profitPercent: BN(0) };
		profit.profit = trade.target.amountOut.sub(repay);
		const profitBN = JS2BN(profit.profit, trade.tokenOut.decimals);
		profit.profitPercent = trade.target.amountOut.gt(0) ? profitBN.dividedBy(fu(trade.target.amountOut, trade.tokenOut.decimals)).multipliedBy(100) : BN(0);
		return profit;
		// } else {
		// 	return { profit: BigNumber.from(0), profitPercent: BN(0) };
		// }
	}

	const profits = await getProfit();
	// const postReserveOut = trade.loanPool.reserveOut.add(tradeSizeInTermsOfTokenOutWithFee);				
	return { repays, profits };
}


export async function getDirect(trade: BoolTrade, calc: AmountConverter): Promise<{ repay: BigNumber, profit: BigNumber, percentProfit: BN }> {
	const repay = await calc.addFee(trade.target.tradeSize);
	const directRepayLoanPoolInTokenOut = await getAmountsOut(
		trade.target.tradeSize,
		trade.loanPool.reserveIn, // add 0.3% fee to reserves
		trade.loanPool.reserveOut
	);
	const directRepayLoanPoolInTokenOutWithFee = await calc.addFee(directRepayLoanPoolInTokenOut);
	const profit = trade.target.amountOut.sub(directRepayLoanPoolInTokenOutWithFee); // profit is remainder of token1 out
	const profitBN = JS2BN(profit, trade.tokenOut.decimals);
	const percentProfit = trade.target.amountOut.gt(0) ? profitBN.dividedBy(fu(trade.target.amountOut, trade.tokenOut.decimals)).multipliedBy(100) : BN(0);
	return { repay, profit, percentProfit };
}

