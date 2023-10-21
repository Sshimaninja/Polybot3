import { BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Amounts, FactoryPair, GasData, Pair, Profcalcs, Repays } from "../../constants/interfaces";
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IRouter } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { wallet, flashMulti, flashDirect } from "../../constants/contract";
import { Contract } from "@ethersproject/contracts";
import { Prices } from "./modules/prices";
import { getK } from "./modules/getK";
import { BoolTrade } from "../../constants/interfaces"
import { getMulti, getDirect } from "./modules/populateRepays";
import { getAmountsIn, getAmountsOut } from "./modules/getAmountsIOLocal";
import { AmountConverter } from "./modules/amountConverter";
import { JS2BN, JS2BNS, BN2JS, BN2JSS, fu, pu } from "./modules/convertBN";
import { filterTrade } from "./modules/filterTrade";
/**
 * @description
 * Class to determine trade parameters 
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
		const safeReserves = loan.reserves.reserveIn.mul(1000).div(800);
		const size = bestSize.gt(safeReserves) ? safeReserves : bestSize;

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
					repay: BigNumber.from(0),
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


		const filteredTrade = await filterTrade(trade);
		if (filteredTrade == undefined) {
			return trade;
		}

		// Define repay & profit for each trade type: 
		const multi = await getMulti(trade, this.calc0);
		const direct = await getDirect(trade, this.calc0);

		// subtract the result from amountOut to get profit
		// The below will be either in token0 or token1, depending on the trade type.
		// Set repayCalculation here for testing, until you find the correct answer (of which there is only 1):
		trade.loanPool.amountRepay = trade.type === "multi" ? multi.repays.repay : direct.repay;

		trade.type = multi.profits.profit.gt(direct.profit) ? "multi" : "direct";


		trade.loanPool.amountRepay = trade.type === "multi" ? multi.repays.repay : direct.repay;

		trade.loanPool.repays = multi.repays;

		trade.profit = trade.type === "multi" ? multi.profits.profit : direct.profit;

		trade.profitPercent = trade.type == "multi" ?
			pu((multi.profits.profitPercent.toFixed(trade.tokenOut.decimals)), trade.tokenOut.decimals) :
			pu((direct.percentProfit.toFixed(trade.tokenOut.decimals)), trade.tokenOut.decimals);


		trade.flash = trade.type === "multi" ? flashMulti : flashDirect;

		trade.k = await getK(trade.type, trade.target.tradeSize, trade.loanPool.reserveIn, trade.loanPool.reserveOut, this.calc0);

		// return trade;
		return trade

	}
}
