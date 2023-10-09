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
	amounts0: Amounts;
	amounts1: Amounts;
	gasData: GasData;

	constructor(pair: FactoryPair, match: Pair, price0: Prices, price1: Prices, amounts0: Amounts, amounts1: Amounts, gasData: GasData) {
		this.pair = pair;
		this.price0 = price0;
		this.price1 = price1;
		this.match = match;
		this.amounts0 = amounts0
		this.amounts1 = amounts1;
		this.gasData = gasData;
	}

	// Get repayment amount for the loanPool direct tokent trade
	async getRepayMulti(tradeSize: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
		const amountRepay = await getAmountsIn(tradeSize, reserveIn, reserveOut); // result must be token1
		return amountRepay; //in token1
	}

	// Get repayment amount for the loanPool multitoken trade
	async getRepayDirect(tradeSize: BigNumber): Promise<BigNumber> {
		const repay = tradeSize.mul(1003009027).div(1000000000);
		return repay; //in token0
	}

	async direction(): Promise<string> {
		const A = this.price0.priceOutBN;
		const B = this.price1.priceOutBN;
		const diff = A.minus(B)
		const dperc = diff.div(A).multipliedBy(100)// 0.6% price difference required for trade (0.3%) + loan repayment (0.3%) on Uniswap V2
		const dir = dperc.gt(0.6) ? "A" : dperc.lt(-0.6) ? "B" : "[getTrade]: PRICE DIFFERENCE LOWER THAN FEES.";
		return dir;
	}

	async getTrade(): Promise<BoolTrade> {
		const trade: BoolTrade = {
			direction: await this.direction(),
			type: "error",
			ticker: this.match.token0.symbol + "/" + this.match.token1.symbol,
			tokenIn: this.match.token0,
			tokenOut: this.match.token1,
			flash: flashMulti, // This has to be set initially, but must be changed later per type.
			loanPool: {
				exchange: "A" ? this.pair.exchangeB : this.pair.exchangeA,
				factory: "A" ? new Contract(this.pair.factoryB_id, IFactory, wallet) : new Contract(this.pair.factoryA_id, IFactory, wallet),
				router: "A" ? new Contract(this.pair.routerB_id, IRouter, wallet) : new Contract(this.pair.routerA_id, IRouter, wallet),
				pool: "A" ? new Contract(this.match.poolB_id, IPair, wallet) : new Contract(this.match.poolA_id, IPair, wallet),
				reserveIn: "A" ? this.price1.reserves.reserveIn : this.price0.reserves.reserveIn,
				reserveInBN: "A" ? this.price1.reserves.reserveInBN : this.price0.reserves.reserveInBN,
				reserveOut: "A" ? this.price1.reserves.reserveOut : this.price0.reserves.reserveOut,
				reserveOutBN: "A" ? this.price1.reserves.reserveOutBN : this.price0.reserves.reserveOutBN,
				priceIn: "A" ? this.price1.priceInBN.toFixed(this.match.token0.decimals) : this.price0.priceInBN.toFixed(this.match.token0.decimals),
				priceOut: "A" ? this.price1.priceOutBN.toFixed(this.match.token1.decimals) : this.price0.priceOutBN.toFixed(this.match.token1.decimals),
				amountOut: BigNumber.from(0),
			},
			recipient: {
				exchange: "A" ? this.pair.exchangeA : this.pair.exchangeB,
				factory: "A" ? new Contract(this.pair.factoryA_id, IFactory, wallet) : new Contract(this.pair.factoryB_id, IFactory, wallet),
				router: "A" ? new Contract(this.pair.routerA_id, IRouter, wallet) : new Contract(this.pair.routerB_id, IRouter, wallet),
				pool: "A" ? new Contract(this.match.poolA_id, IPair, wallet) : new Contract(this.match.poolB_id, IPair, wallet),
				reserveIn: "A" ? this.price0.reserves.reserveIn : this.price1.reserves.reserveIn,
				reserveInBN: "A" ? this.price0.reserves.reserveInBN : this.price1.reserves.reserveInBN,
				reserveOut: "A" ? this.price0.reserves.reserveOut : this.price1.reserves.reserveOut,
				reserveOutBN: "A" ? this.price0.reserves.reserveOutBN : this.price1.reserves.reserveOutBN,
				priceIn: "A" ? this.price0.priceInBN.toFixed(this.match.token0.decimals) : this.price1.priceInBN.toFixed(this.match.token0.decimals),
				priceOut: "A" ? this.price0.priceOutBN.toFixed(this.match.token1.decimals) : this.price1.priceOutBN.toFixed(this.match.token1.decimals),

				// Unclear what is the best strategy for tradesize.
				tradeSize: "A" ? this.amounts0.toPrice : this.amounts1.toPrice,
				// tradeSize: A ? 
				// 	(this.amounts0.maxIn.lt(this.amounts1.maxOut) ? this.amounts0.maxIn : this.amounts1.maxOut) :
				// 	(this.amounts1.maxIn.lt(this.amounts0.maxOut) ? this.amounts1.maxIn : this.amounts0.maxOut),

				amountOut: BigNumber.from(0),
			},
			k: {
				uniswapKPre: BigNumber.from(0),
				uniswapKPost: BigNumber.from(0),
				uniswapKPositive: false,
			},
			gasData: this.gasData,
			amountRepay: BigNumber.from(0), // decided based on direct v multi trade returns
			profit: BigNumber.from(0),
			profitPercent: BigNumber.from(0),
		};

		//We need the amountOut of tokenIn for directRepay from loanpool to see now much of token0 loan can be repaid, if the trade is direct.
		trade.loanPool.amountOut = await getAmountsOut(
			trade.recipient.amountOut,
			trade.loanPool.reserveOut,
			trade.loanPool.reserveIn);

		trade.recipient.amountOut = await getAmountsOut(
			trade.recipient.tradeSize,
			trade.recipient.reserveIn,
			trade.recipient.reserveOut);

		// arbitrage type options: 
		const multiRepay = await this.getRepayMulti(
			trade.recipient.tradeSize,
			trade.loanPool.reserveOut,
			trade.loanPool.reserveIn
		) //in token1

		const directRepay = await this.getRepayDirect(
			trade.recipient.tradeSize,
		) //in token0

		const profitMulti = trade.recipient.amountOut.sub(multiRepay)

		const profitDirect = trade.loanPool.amountOut.sub(directRepay)

		trade.type = profitMulti.gt(profitDirect) ? "multi" : "direct";

		trade.amountRepay = trade.type === "multi" ? multiRepay : directRepay;

		trade.profit = trade.type === "multi" ? profitMulti : profitDirect;

		trade.profitPercent = trade.profit.mul(100).div(trade.amountRepay);

		trade.flash = trade.type === "multi" ? flashMulti : flashMulti;

		trade.k = await getK(trade);

		return trade;
	}
}

