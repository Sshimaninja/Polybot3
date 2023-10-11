import { BigNumber, utils as u } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Amounts, FactoryPair, GasData, Pair, Profit, K } from "../../constants/interfaces";
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IRouter } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { wallet, flashMulti } from "../../constants/contract";
import { Contract } from "@ethersproject/contracts";
import { Prices } from "./modules/prices";
import { getK } from "./modules/getK";
import { BoolTrade } from "../../constants/interfaces"
import { getAmountsIn, getAmountsOut } from "./modules/getAmountsIOLocal";
import { getImpact } from "./modules/getImpact";
import { getProfitInTokenOut } from "./modules/getProfitInTokenOut";
import { AmountConverter } from "./modules/amountConverter";

/**
 * @description
 * Class to determine trade direction 
 * returns a BoolTrade object, which fills out all params needed for a trade.
  * 
*/

/*
I prefer deciding trade based on profit, but it migth be necessary to decide based on price.
The technique for using profit would be to calc the repay, then work out profit, then use that to determine direction, et voila.
however, this works for now.
let A: BigNumber = this.amounts0.amountOutJS.sub(amountRepayB);
let B: BigNumber = this.amounts1.amountOutJS.sub(amountRepayA);
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
	async getRepayDirect(tradeSize: BigNumber): Promise<BigNumber> {
		const repay = tradeSize.mul(1003009027).div(1000000000);
		return repay; //in token0
	}

	// Here, I attempt to determine the direction of the trade allowing negative expression to inform direction
	// async direction() {
	// 	const diff = this.price0.priceOutBN.minus(this.price1.priceOutBN)
	// 	const dperc = diff.div(this.price0.priceOutBN).multipliedBy(100)// 0.6% price difference required for trade (0.3%) + loan repayment (0.3%) on Uniswap V2
	// 	const dir = dperc.gt(0.6) ? "A" : dperc.lt(-0.6) ? "B" : "[getTrade]: PRICE DIFFERENCE LOWER THAN FEES.";
	// 	return { dir, diff, dperc };
	// }

	// Another method forces a positive value, in line with ethers BigNumbers preference for positive values.
	// Making this trade in any way viable may require taking reserves into account. 
	// That might make this more comlicated than it needs to be.
	// Though if that's the case exactly what is wrong with this method?
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
		const A = dir.dir == "A"
		const trade: BoolTrade = {
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

				// Unclear what is the best strategy for tradesize.
				// Would be good to have a strategy that takes into account the reserves of the pool and uses the min of the three below.
				// Also would be good to have a function that determines the optimal tradesize for a given pool.
				// for this tradeSize, amounts0.price gets passed amounts1.price as target, and vice versa.
				tradeSize: A ? await this.amounts0.tradeToPrice() : await this.amounts1.tradeToPrice(),
				// tradeSize: A ? // This is a possible solution but it results in div-by-zero error (likely due to toPrice being negative sometimes)
				// this.amounts0.toPrice.lt(this.amounts0.maxIn) ? this.amounts0.toPrice : this.amounts0.maxIn :
				// this.amounts1.toPrice.lt(this.amounts1.maxIn) ? this.amounts1.toPrice : this.amounts1.maxIn,

				// tradeSize: A ? // Using the following results in div-by-zero error. 
				// (this.amounts0.maxIn.lt(this.amounts1.maxOut) ? this.amounts0.maxIn : this.amounts1.maxOut) :
				// (this.amounts1.maxIn.lt(this.amounts0.maxOut) ? this.amounts1.maxIn : this.amounts0.maxOut),
				amountOut: BigNumber.from(0),
			},
			k: {
				uniswapKPre: BigNumber.from(0),
				uniswapKPost: BigNumber.from(0),
				uniswapKPositive: false,
			},
			gasData: this.gasData,
			amountRepay: BigNumber.from(0), // decided based on direct v multi trade returns
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

			const multiRepay = await this.getRepayMulti(
				trade.recipient.amountOut,
				trade.loanPool.reserveOut,
				trade.loanPool.reserveIn
			); //repayment in token1 using getAmountIn

			const directRepay = await this.getRepayDirect(trade.recipient.tradeSize); //repayment in token0 using simple addition of 0.3%

			const profitMulti = multiRepay.sub(trade.recipient.amountOut); // token1 repay - token1 out

			const profitDirect = trade.recipient.tradeSize.sub(directRepay); // token0 borrowed - token0 repay

			trade.type = profitMulti.gt(profitDirect) ? "multi" : "direct";

			// The below will be either in token0 or token1, depending on the trade type.
			trade.amountRepay = trade.type === "multi" ? multiRepay : directRepay;
			///////////////////////////////////////////////////////////////////////////////

			trade.profit = trade.type === "multi" ? profitMulti : profitDirect;
			//////////////////////////////////////////////////////////////////////////
			try {
				trade.profitPercent = trade.type == "multi" ?
					profitMulti.mul(100).div(trade.recipient.amountOut) :
					profitDirect.mul(100).div(trade.recipient.tradeSize);
			} catch (error: any) {
				console.log("Error in division by tiny numbers: " + error.message)
				console.log(error.message)
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

