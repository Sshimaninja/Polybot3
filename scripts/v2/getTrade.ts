import { BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Amounts, FactoryPair, GasData, Pair, Profcalcs, Repays } from "../../constants/interfaces";
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IRouter } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { wallet, flashMulti } from "../../constants/contract";
import { Contract } from "@ethersproject/contracts";
import { Prices } from "./modules/prices";
import { getK } from "./modules/getK";
import { BoolTrade } from "../../constants/interfaces"
import { getAmountsIn, getAmountsOut } from "./modules/getAmountsIOLocal";
import { AmountConverter } from "./modules/amountConverter";
import { JS2BN, JS2BNS, BN2JS, BN2JSS, fu, pu } from "./modules/convertBN";
/**
 * @description
 * Class to determine trade direction 
 * returns a BoolTrade object, which fills out all params needed for a trade.
  * 
*/

export class Trade {
	trade: BoolTrade | undefined;
	pair: FactoryPair;
	match: Pair;
	price0: Prices;
	price1: Prices;
	slip: BN;
	gasData: GasData;

	calc0: AmountConverter;
	calc1: AmountConverter;

	constructor(pair: FactoryPair, match: Pair, price0: Prices, price1: Prices, slip: BN, gasData: GasData) {
		this.pair = pair;
		this.price0 = price0;
		this.price1 = price1;
		this.match = match;
		this.slip = slip;
		this.gasData = gasData;
		// Pass in the opposing pool's priceOut as target
		this.calc0 = new AmountConverter(price0, match, this.price1.priceOutBN, slip);
		this.calc1 = new AmountConverter(price1, match, this.price0.priceOutBN, slip);
	}

	async direction() {
		const A = this.price0.priceOutBN
		const B = this.price1.priceOutBN
		const diff = A.lt(B) ? B.minus(A) : A.minus(B)
		const dperc = diff.div(A.gt(B) ? A : B).multipliedBy(100)// 0.6% price difference required for trade (0.3%) + loan repayment (0.3%) on Uniswap V2
		const dir = A.lt(B) ? "A" : "B"
		return { dir, diff, dperc }
	}

	async getSize(loan: AmountConverter, target: AmountConverter): Promise<BigNumber> {
		const toPrice = await target.tradeToPrice()
		// use maxIn, maxOut to make sure the trade doesn't revert due to too much slippage on target
		const maxIn = await target.getMaxTokenIn();
		const bestSize = toPrice.lt(maxIn) ? toPrice : maxIn;
		const size = bestSize.gt(loan.reserves.reserveIn) ? loan.reserves.reserveIn : bestSize;
		return size;
	}

	async getTrade() {
		const dir = await this.direction();
		const A = dir.dir == "A" ? true : false;

		const trade: BoolTrade = {
			ID: A ? this.match.poolB_id + this.match.poolA_id : this.match.poolA_id + this.match.poolB_id,
			direction: dir.dir,
			type: "error",
			ticker: this.match.token0.symbol + "/" + this.match.token1.symbol,
			tokenIn: this.match.token0,
			tokenOut: this.match.token1,
			flash: flashMulti, // This has to be set initially, but must be changed later per type.
			loanPool: {
				exchange: A ? this.pair.exchangeB : this.pair.exchangeA,
				factory: A ? new Contract(this.pair.factoryB_id, IFactory, wallet) : new Contract(this.pair.factoryA_id, IFactory, wallet),
				router: A ? new Contract(this.pair.routerB_id, IRouter, wallet) : new Contract(this.pair.routerA_id, IRouter, wallet),
				pool: A ? new Contract(this.match.poolB_id, IPair, wallet) : new Contract(this.match.poolA_id, IPair, wallet),
				reserveIn: A ? this.price1.reserves.reserveIn : this.price0.reserves.reserveIn,
				reserveInBN: A ? this.price1.reserves.reserveInBN : this.price0.reserves.reserveInBN,
				reserveOut: A ? this.price1.reserves.reserveOut : this.price0.reserves.reserveOut,
				reserveOutBN: A ? this.price1.reserves.reserveOutBN : this.price0.reserves.reserveOutBN,
				priceIn: A ? this.price1.priceInBN.toFixed(this.match.token0.decimals) : this.price0.priceInBN.toFixed(this.match.token0.decimals),
				priceOut: A ? this.price1.priceOutBN.toFixed(this.match.token1.decimals) : this.price0.priceOutBN.toFixed(this.match.token1.decimals),
				repays: {
					simpleMulti: BigNumber.from(0),
					getAmountsOut: BigNumber.from(0),
					getAmountsIn: BigNumber.from(0),
				},
				amountRepay: BigNumber.from(0),

			},
			target: {
				exchange: A ? this.pair.exchangeA : this.pair.exchangeB,
				factory: A ? new Contract(this.pair.factoryA_id, IFactory, wallet) : new Contract(this.pair.factoryB_id, IFactory, wallet),
				router: A ? new Contract(this.pair.routerA_id, IRouter, wallet) : new Contract(this.pair.routerB_id, IRouter, wallet),
				pool: A ? new Contract(this.match.poolA_id, IPair, wallet) : new Contract(this.match.poolB_id, IPair, wallet),
				reserveIn: A ? this.price0.reserves.reserveIn : this.price1.reserves.reserveIn,
				reserveInBN: A ? this.price0.reserves.reserveInBN : this.price1.reserves.reserveInBN,
				reserveOut: A ? this.price0.reserves.reserveOut : this.price1.reserves.reserveOut,
				reserveOutBN: A ? this.price0.reserves.reserveOutBN : this.price1.reserves.reserveOutBN,
				priceIn: A ? this.price0.priceInBN.toFixed(this.match.token0.decimals) : this.price1.priceInBN.toFixed(this.match.token0.decimals),
				priceOut: A ? this.price0.priceOutBN.toFixed(this.match.token1.decimals) : this.price1.priceOutBN.toFixed(this.match.token1.decimals),
				//TODO: FIX THE CALCS FOR MAXIN() WHICH ARE WRONG.
				tradeSize: A ? await this.getSize(this.calc1, this.calc0) : await this.getSize(this.calc0, this.calc1),
				amountOut: BigNumber.from(0),
			},
			k: {
				uniswapKPre: BigNumber.from(0),
				uniswapKPost: BigNumber.from(0),
				uniswapKPositive: false,
			},
			gasData: this.gasData,
			differenceTokenOut: dir.diff.toFixed(this.match.token1.decimals) + " " + this.match.token1.symbol,
			differencePercent: dir.dperc.toFixed(this.match.token1.decimals) + "%",
			profit: BigNumber.from(0),
			profitPercent: BigNumber.from(0),
		};

		trade.target.amountOut = await getAmountsOut(
			trade.target.tradeSize, // token0 in given
			trade.target.reserveIn, // token0 in 
			trade.target.reserveOut); // token1 max out

		// arbitrage type options: 
		if (trade.target.tradeSize.gt('0') && trade.target.amountOut.gt('0') && trade.target.reserveIn.gt('1') && trade.target.reserveOut.gt('1')) {

			// Define repay for each trade type: 
			async function getMulti(calc: AmountConverter): Promise<{ repays: Repays, profits: { profit: BigNumber, profitPercent: BN } }> {
				/*
				I have to send back only the amount of token1 needed to repay the amount of token0 I was loaned.
				Thus I need to calculate the exact amount of token1 that tradeSize in tokenOut represents on loanPool, 
				and subtract it from recipient.amountOut before sending it back
				*/
				// const postReserveIn = trade.loanPool.reserveIn.sub(trade.target.tradeSize); // I think this is only relevant for uniswap K calcs				
				async function getRepay(): Promise<Repays> {
					const tradeSizeInTermsOfTokenOutOnLoanPool =
						trade.target.tradeSize.mul(trade.loanPool.reserveOut).div(trade.loanPool.reserveIn);
					const repayByGetAmounsOut = await getAmountsOut(// getAmountsOut is used here, but you can also use getAmountsIn, as they can achieve similar results by switching reserves.
						trade.target.tradeSize,
						trade.loanPool.reserveIn,
						trade.loanPool.reserveOut // <= Will return in terms of this reserve. If this is reserveIn, will return in terms of tokenIn. If this is reserveOut, will return in terms of tokenOut.
					)
					const repayByGetAmoutsIn = await getAmountsIn( //Will output tokenIn.
						trade.target.tradeSize,
						trade.loanPool.reserveOut, // <= Will return in terms of this reserve. If this is reserveIn, will return in terms of tokenIn. If this is reserveOut, will return in terms of tokenOut.
						trade.loanPool.reserveIn
					)
					const repays: Repays = {
						simpleMulti: await calc.addFee(tradeSizeInTermsOfTokenOutOnLoanPool),
						getAmountsOut: repayByGetAmounsOut,
						getAmountsIn: repayByGetAmoutsIn,
					}
					return repays;
				}




				const repays = await getRepay();

				async function getProfit(): Promise<Profcalcs> {
					let repay = repays.getAmountsIn;
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


			async function getDirect(calc: AmountConverter): Promise<{ repay: BigNumber, profit: BigNumber, percentProfit: BN }> {
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



			const multi = await getMulti(this.calc0);
			const direct = await getDirect(this.calc0);
			// subtract the result from amountOut to get profit

			// The below will be either in token0 or token1, depending on the trade type.
			// Set repayCalculation here for testing, until you find the correct answer (of which there is only 1):
			trade.loanPool.amountRepay = trade.type === "multi" ? multi.repays.getAmountsIn : direct.repay;


			trade.type = multi.profits.profit.gt(direct.profit) ? "multi" : "direct";


			trade.loanPool.amountRepay = trade.type === "multi" ? multi.repays.getAmountsIn : direct.repay;

			trade.loanPool.repays = multi.repays;

			trade.profit = trade.type === "multi" ? multi.profits.profit : direct.profit;

			trade.profitPercent = trade.type == "multi" ?
				pu((multi.profits.profitPercent.toFixed(trade.tokenOut.decimals)), trade.tokenOut.decimals) :
				pu((direct.percentProfit.toFixed(trade.tokenOut.decimals)), trade.tokenOut.decimals);


			trade.flash = trade.type === "multi" ? flashMulti : flashMulti;

			trade.k = await getK(trade.type, trade.target.tradeSize, trade.loanPool.reserveIn, trade.loanPool.reserveOut, this.calc0);

			// return trade;
			return trade

		} else {
			console.log("<<<<<<No trade: tradeSize is zero or negative: ", trade.ticker, ">>>>>>>");
			return trade;
		}
	}
}

