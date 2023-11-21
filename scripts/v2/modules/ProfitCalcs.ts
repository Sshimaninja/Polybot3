import { BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { BoolTrade, Profcalcs, Repays } from "../../../constants/interfaces";
import { JS2BN, fu } from "../../modules/convertBN";
import { AmountConverter } from "./amountConverter";



export class ProfitCalculator {
	repays: Repays;
	trade: BoolTrade;
	calc: AmountConverter;

	constructor(trade: BoolTrade, calc: AmountConverter, repays: Repays) {
		this.trade = trade;
		this.calc = calc;
		this.repays = repays;
	}

	async getMultiProfit(): Promise<Profcalcs> {
		let profit: Profcalcs = { profit: BigNumber.from(0), profitPercent: BN(0) };
		profit.profit = this.trade.target.amountOut.sub(this.repays.repay);
		const profitBN = JS2BN(profit.profit, this.trade.tokenOut.decimals);
		profit.profitPercent = this.trade.target.amountOut.gt(0) ? profitBN.dividedBy(fu(this.trade.target.amountOut, this.trade.tokenOut.decimals)).multipliedBy(100) : BN(0);
		return profit;
	}

	async getDirectProfit(this: any): Promise<Profcalcs> {
		const repays = await this.repays;
		const profit = this.trade.target.amountOut.sub(repays.directInTokenOut);
		const profitBN = JS2BN(profit, this.trade.tokenOut.decimals);
		const profitPercent = this.trade.target.amountOut.gt(0) ? profitBN.dividedBy(fu(this.trade.target.amountOut, this.trade.tokenOut.decimals)).multipliedBy(100) : BN(0);
		const profCalcs = { profit, profitPercent };
		return profCalcs;
	}
}
