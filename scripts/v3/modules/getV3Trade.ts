import { BigNumber, utils as u } from "ethers";
import { Amounts, FactoryPair, GasData, Pair, Profit, K } from "../../constants/interfaces";
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IRouter } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { wallet, flashMulti } from "../../constants/contract";
import { Contract } from "@ethersproject/contracts";
import { Prices } from "./prices";
import { getK } from "./getK";
import { BoolTrade } from "../../constants/interfaces"
import { getAmountsIn, getAmountsOut } from "./getAmountsIOLocal";
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

	// Get repayment amount for the loanPool
	async getRepayMulti(tradeSize: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
		const amountRepay = await getAmountsIn(tradeSize, reserveIn, reserveOut); // result must be token1
		return amountRepay; //in token1
	}

	// Get repayment amount for the loanPool
	async getRepayDirect(tradeSize: BigNumber): Promise<BigNumber> {
		const repay = tradeSize.mul(1003009027).div(1000000000);
		return repay; //in token0
	}

	async getTrade(): Promise<BoolTrade> {

		const A = this.price0.priceOutBN;
		const B = this.price1.priceOutBN;

		const direction = A.lt(B) ? "A" : B.lt(A) ? "B" : "DIRECTIONAL AMBIGUITY ERROR";

		const trade: BoolTradeV3 = {
			direction: direction,
			type: "error",
			ticker: this.match.token0.symbol + "/" + this.match.token1.symbol,
			tokenIn: this.match.token0,
			tokenOut: this.match.token1,
			flash: flashMulti,
			loanPool: {
				exchange: A ? this.pair.exchangeB : this.pair.exchangeA,
				factory: A ? new Contract(this.pair.factoryB_id, IFactory, wallet) : new Contract(this.pair.factoryA_id, IFactory, wallet),
				router: A ? new Contract(this.pair.routerB_id, IRouter, wallet) : new Contract(this.pair.routerA_id, IRouter, wallet),
				pool: A ? new Contract(this.match.poolB_id, IPair, wallet) : new Contract(this.match.poolA_id, IPair, wallet),
				feeTier: A ? this.pair.feeTierB : this.pair.feeTierA,
				reserveIn: A ? this.price1.reserves.reserveIn : this.price0.reserves.reserveIn,
				reserveOut: A ? this.price1.reserves.reserveOut : this.price0.reserves.reserveOut,
				priceIn: A ? this.price1.priceInBN.toFixed(this.match.token0.decimals) : this.price0.priceInBN.toFixed(this.match.token0.decimals),
				priceOut: A ? this.price1.priceOutBN.toFixed(this.match.token1.decimals) : this.price0.priceOutBN.toFixed(this.match.token1.decimals),
				amountOut: BigNumber.from(0),
			},
			recipient: {
				exchange: A ? this.pair.exchangeA : this.pair.exchangeB,
				factory: A ? new Contract(this.pair.factoryA_id, IFactory, wallet) : new Contract(this.pair.factoryB_id, IFactory, wallet),
				router: A ? new Contract(this.pair.routerA_id, IRouter, wallet) : new Contract(this.pair.routerB_id, IRouter, wallet),
				pool: A ? new Contract(this.match.poolA_id, IPair, wallet) : new Contract(this.match.poolB_id, IPair, wallet),
				feeTier: A ? this.pair.feeTierA : this.pair.feeTierB,
				reserveIn: A ? this.price0.reserves.reserveIn : this.price1.reserves.reserveIn,
				reserveOut: A ? this.price0.reserves.reserveOut : this.price1.reserves.reserveOut,
				priceIn: A ? this.price0.priceInBN.toFixed(this.match.token0.decimals) : this.price1.priceInBN.toFixed(this.match.token0.decimals),
				priceOut: A ? this.price0.priceOutBN.toFixed(this.match.token1.decimals) : this.price1.priceOutBN.toFixed(this.match.token1.decimals),
				tradeSize: A ? //this.amounts0.tradeSize : this.amounts1.tradeSize,
					(this.amounts0.tradeSize.lt(this.price1.reserves.reserveIn) ? this.amounts0.tradeSize : this.price1.reserves.reserveIn) :
					(this.amounts1.tradeSize.lt(this.price0.reserves.reserveIn) ? this.amounts1.tradeSize : this.price0.reserves.reserveIn),
				amountOut: A ? this.amounts0.amountOutJS : this.amounts1.amountOutJS,
			},
			k: {
				uniswapKPre: BigNumber.from(0),
				uniswapKPost: BigNumber.from(0),
				uniswapKPositive: false,
			},
			gasData: this.gasData,
			amountRepay: BigNumber.from(0), // decided based on direct v multi trade returns
			profit: BigNumber.from(0)
		};

		//We need the amountOut of tokenIn for directRepay from loanpool to see now much of token0 loan can be repaid, if the trade is direct.
		trade.loanPool.amountOut = await getAmountsOut(
			trade.recipient.amountOut,
			trade.loanPool.reserveOut,
			trade.loanPool.reserveIn);

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

		trade.k = await getK(trade);

		return trade;
	}
}

