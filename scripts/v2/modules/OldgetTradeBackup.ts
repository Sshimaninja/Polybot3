import { BigNumber, utils as u } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Amounts, FactoryPair, GasData, Pair, Profit, K } from "../../../constants/interfaces";
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IRouter } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { wallet, flashMulti } from "../../../constants/contract";
import { Contract } from "@ethersproject/contracts";
import { Prices } from "./prices";
import { getK } from "./getK";
import { BoolTrade } from "../../../constants/interfaces"
import { getAmountsIn, getAmountsOut } from "./getAmountsIOLocal";
import { getImpact } from "./getImpact";
import { getProfitInTokenOut } from "./getProfitInTokenOut";
import { AmountConverter } from "./amountConverter";

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

	amounts0: AmountConverter;
	amounts1: AmountConverter;

	constructor(pair: FactoryPair, match: Pair, price0: Prices, price1: Prices, slip: BN, gasData: GasData) {
		this.pair = pair;
		this.price0 = price0;
		this.price1 = price1;
		this.match = match;
		this.slip = slip;
		this.gasData = gasData;
		// Pass in the opposing pool's priceOut as target
		this.amounts0 = new AmountConverter(price0, match, this.price1.priceOutBN, slip);
		this.amounts1 = new AmountConverter(price1, match, this.price0.priceOutBN, slip);
	}

	// Get repayment amount for the loanPool direct token trade
	async getRepayMulti(tradeSize: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
		// should be recipient.amountOut, loanPool.reserveIn, loanPool.reserveOut
		const amountRepay = await getAmountsIn(tradeSize, reserveIn, reserveOut); // result must be token1
		return amountRepay; //in token1
	}

	// Get repayment amount for the loanPool multitoken trade
	async addFee(tradeSize: BigNumber): Promise<BigNumber> {
		const repay = tradeSize.mul(1003009027).div(1000000000);
		// ex 100000 * 1003009027 / 1000000000 = 100301
		return repay; //in token0
	}

	async direction() {
		const A = this.price0.priceOutBN
		const B = this.price1.priceOutBN
		const diff = A.lt(B) ? B.minus(A) : A.minus(B)
		const dperc = diff.div(A.gt(B) ? A : B).multipliedBy(100)// 0.6% price difference required for trade (0.3%) + loan repayment (0.3%) on Uniswap V2
		const dir = A.lt(B) ? "A" : "B"
		return { dir, diff, dperc }
	}

	async getTrade() {
		const dir = await this.direction();
		const A = dir.dir == "A" ? true : false;
		const size = A ? await this.amounts0.tradeToPrice() : await this.amounts1.tradeToPrice();
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
				amountRepay: BigNumber.from(0),
			},
			recipient: {
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
				// Would be good to have a strategy that takes into account the reserves of the pool and uses the min of the three below, but that adds a lot of complexity.
				tradeSize: A ? (size.lt(this.price1.reserves.reserveIn) ? size : this.price1.reserves.reserveIn) : size.lt(this.price0.reserves.reserveIn) ? size : this.price0.reserves.reserveIn, // This strategy attempts to use the biggest tradeSize possible. It will use toPrice, despite high slippage, if slippage creates profitable trades. If toPrice is smaller than maxIn(for slippage) it will use maxIn.
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

		trade.recipient.amountOut = await getAmountsOut(
			trade.recipient.tradeSize, // token0 in given
			trade.recipient.reserveIn, // token0 in 
			trade.recipient.reserveOut); // token1 max out

		// arbitrage type options: 
		if (trade.recipient.tradeSize.gt(0)) {

			// Define what repay is for each trade type: 
			const multiRepay = await this.getRepayMulti(
				trade.recipient.amountOut,
				trade.loanPool.reserveOut,
				trade.loanPool.reserveIn
			); //repayment in token1 using getAmountIn

			const directRepay = await this.addFee(trade.recipient.tradeSize); //repayment in token0 using simple addition of 0.3%

			// define what 'profit' is for each trade type: the remainder of token1Out after repay is subtracted, for both direct and multi-trade.
			const profitMulti = multiRepay.sub(trade.recipient.amountOut); // token1 repay - token1 out (profit will be remainder of token1 out)

			// get equivalent to getTokensforExactTokensIn:
			const directRepayinTokenOut = await getAmountsOut(
				directRepay,
				trade.loanPool.reserveIn.add(directRepay.sub(trade.recipient.tradeSize)), // add 0.3% fee to reserves
				trade.loanPool.reserveOut
			)

			// subtract the result from amountOut to get profit
			const profitDirect = trade.recipient.amountOut.sub(directRepayinTokenOut); // profit is remainder of token1 out

			trade.type = profitMulti.gt(profitDirect) ? "multi" : "direct";
			////////////////////////////////////////////////////////////////////////////////

			// The below will be either in token0 or token1, depending on the trade type.
			trade.loanPool.amountRepay = trade.type === "multi" ? multiRepay : directRepay;
			////////////////////////////////////////////////////////////////////////////

			trade.profit = trade.type === "multi" ? profitMulti : profitDirect;
			/////////////////////////////////////////////////////////////////////////

			try {
				const profitMultiBN = BN(u.formatUnits(profitMulti, trade.tokenOut.decimals));
				// console.log("profitMultiBN: ", profitMultiBN.toFixed(trade.tokenOut.decimals));

				const profitDirectBN = BN(u.formatUnits(profitDirect, trade.tokenOut.decimals));
				// console.log("profitDirectBN: ", profitDirectBN.toFixed(trade.tokenIn.decimals));

				const profitPercMultiBN = trade.recipient.amountOut.eq(0) ? BN(0) : profitMultiBN.dividedBy(u.formatUnits(trade.recipient.amountOut, trade.tokenOut.decimals)).multipliedBy(100);
				const profitPercDirectBN = directRepayinTokenOut.eq(0) ? BN(0) : profitDirectBN.dividedBy(u.formatUnits(directRepayinTokenOut, trade.tokenOut.decimals)).multipliedBy(100);

				trade.profitPercent = trade.type == "multi" ?
					u.parseUnits((profitPercMultiBN.toFixed(trade.tokenOut.decimals)), trade.tokenOut.decimals) :
					u.parseUnits((profitPercDirectBN.toFixed(trade.tokenOut.decimals)), trade.tokenOut.decimals);

			} catch (error: any) {
				console.log("Error in profitCalc: " + error.message + " " + trade.ticker + " " + trade.type + " " + trade.profitPercent);
				console.log(error.stack);
			}
			trade.flash = trade.type === "multi" ? flashMulti : flashMulti;

			trade.k = await getK(trade);

			return trade;

		} else {
			console.log("<<<<<<No trade: tradeSize is zero or negative: ", trade.ticker, ">>>>>>>");
			return trade;
		}
	}
}

