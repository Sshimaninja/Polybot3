import { Contract } from "ethers";
import {
	Bool3Trade /*WmaticProfit*/,
	ToWMATICPool,
} from "../../../constants/interfaces";
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { abi as IUniswapv2Router02 } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import { abi as IUniswapV2Factory } from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import { getGas2WMATICArray } from "../../../utils/getToWMATICPool";
import { BigNumber as BN } from "bignumber.js";
import {
	GasToken,
	uniswapV2Factory,
	ExchangeMap,
} from "../../../constants/addresses";
import { provider } from "../../../constants/provider";
import { logger } from "../../../constants/logger";
import { fu, pu } from "../../modules/convertBN";
import { zero, wmatic } from "../../../constants/environment";
import { IRLbigint } from "../modules/price/getIRLbigint";
import { InRangeLiquidity } from "./InRangeLiquidity";
import { getLeanIRLBN } from "../modules/price/spartanPriceBN";
/**
 * @description
 * This function returns the profit in wmatic for a given trade.
 * @param trade
 * @returns wmaticProfit{profitInWMATIC: bigint, gasPool: Contract}
 */

// TODO: This function is messy/ugly but it works (finally). Refactor into a Class.

///THIS FUNCITON ONLY RETURNS THE POOL, NOT THE ACTUAL PROFIT IN WMATIC. MAKE IT RETURN THE PROFIT OR IT'S USELESS.

/// THAT IS PROBABLY WHY YOU'RE GETTING 0n FOR PROFIT CALCULATIONS.

export class WMATICFlashProfit {
	trade: Bool3Trade;
	exchanges: ExchangeMap;
	wmaticID: string;
	profitInWMATIC: bigint;
	gasTokens: GasToken;
	gasRouter: Contract | undefined;
	gasPool: Contract | undefined;
	tokenProfitBN: BN;
	toWMATIC: any;
	constructor(trade: Bool3Trade, gasTokens: GasToken, exchanges: ExchangeMap) {
		this.gasTokens = gasTokens;
		this.exchanges = exchanges;
		this.trade = trade;
		this.wmaticID = this.gasTokens.WMATIC;
		this.profitInWMATIC = 0n;
		this.gasRouter = trade.loanPool.router;
		this.gasPool = trade.target.pool;
		this.tokenProfitBN = BN(
			fu(
				this.trade.profits.tokenProfit,
				this.trade.tokenOut.decimals,
			),
		);
	}

	//  async getProfitInWMATIC(trade: Bool3Trade) {
	//     const wmatic: string = this.gasTokens.WMATIC;
	//     let exchanges = Object.values(uniswapV2Factory);
	//     let exchangesChecked: string[] = [];

	//     let profitInWMATIC: bigint;
	//     let gasRouter: Contract;
	//     let gasPool: Contract;

	// IF EITHER TOKENIN OR TOKENOUT IS WMATIC, RETURN THE PROFIT IN WMATIC.

	async getWMATICProfit(): Promise<bigint> {
		let profitInWMATIC: bigint | undefined;
		if (this.trade.tokenIn.id === this.wmaticID) {
			profitInWMATIC = await this.tradeTokenIsWMATIC();
		}
		if (this.trade.tokenOut.id === this.wmaticID) {
			profitInWMATIC = await this.profitTokenIsWMATIC();
		}
		if (profitInWMATIC === undefined) {
			profitInWMATIC = await this.scanAllExchangesForWMATIC();
		}
		if (profitInWMATIC === undefined) {
			profitInWMATIC = await this.gasTokentoWMATICPrice();
		} else if (profitInWMATIC === undefined) {
			// console.log(
			//     "Profit token has no value: ",
			//     this.trade.ticker,
			//     "Profit in tokenOut: ",
			//     fu(this.trade.profits.tokenProfit, this.trade.tokenOut.decimals),
			// );
			profitInWMATIC = 0n;
		}
		if (profitInWMATIC === undefined) {
			// console.log(
			//     ">>>>>>>>>Profit in WMATIC is undefined. trade: ",
			//     this.trade.ticker,
			//     "<<<<<<<<<<<<<<<<<<<<<<<<<<",
			// );
			return 0n;
		}
		return profitInWMATIC;
	}

	async profitTokenIsWMATIC(): Promise<bigint | undefined> {
		if (this.trade.tokenOut.id == this.wmaticID) {
			// console.log("[getProfitInWmatic]: tokenOut is WMATIC");
			let profitInWMATIC = this.trade.profits.tokenProfit;
			let gasRouter = this.trade.target.router;
			let gasPool = this.trade.target.pool;
			// console.log(
			//     "[getProfitInWmatic]: profitInWMATIC: " +
			//         fu(profitInWMATIC, 18) +
			//         " gasRouter: " +
			//         (await gasRouter.getAddress()) +
			//         " gasPool: " +
			//         (await gasPool.getAddress()),
			// );
			return profitInWMATIC;
		}
	}

	async tradeTokenIsWMATIC(): Promise<bigint | undefined> {
		if (this.trade.tokenIn.id == this.wmaticID) {
			// console.log("[getprofitInWMATIC]: tokenIn is WMATIC");
			// console.log(
			//     "[getProfitInWmatic] CHECK TOKENPROFIT TO BN CONVERSION: ",
			//     this.tokenProfitBN,
			//     this.tokenProfitBN.toFixed(this.trade.tokenOut.decimals),
			// );

			let inWMATIC = this.trade.profits.tokenProfit * this.trade.loanPool.priceOut;

			//let inMatic = await getAmountsOutBN(
			//	this.tokenProfitBN,
			//	this.trade.target.reserveOutBN,
			//	this.trade.target.reserveInBN,
			//);
			// let inMatic = await this.trade.loanPool.router.getAmountsOut(
			//     this.trade.profits.tokenProfit,
			//     [this.trade.tokenOut.id, wmatic],
			// );
			// console.log(
			//     "[getProfitInWmatic] CHECK TOKENPROFITBN TO WMATIC CONVERSION: ",
			//     inMatic,
			//     inMatic.toFixed(this.trade.tokenOut.decimals),
			// );

			let gasRouter = this.trade.loanPool.router;
			let gasPool = this.trade.target.pool;

			let profitInWMATIC = inWMATIC;
			// console.log(
			//     ">>>>[getProfitInWmatic]:  profitInWMATICBN:  " + inMatic,
			//     " string: ",
			//     inMatic.toFixed(18),
			//     " bigint: ",
			//     profitInWMATIC,
			//     "<<<<<<<<<<<<<<<<<<<<<<<<<",
			//     " bigint string: ",
			//     fu(profitInWMATIC, 18),
			// );
			return profitInWMATIC;
		}
	}

	// IF NEITHER TOKEN IS WMATIC, CHECK FOR A WMATIC POOL ON OTHER EXCHANGES.
	async scanAllExchangesForWMATIC(): Promise<bigint | undefined> {
		for (let f of Object.values(this.exchanges)) {
			// CHECK TOKENOUT -> WMATIC FIRST:
			let factory = new Contract(f.factory, IUniswapV2Factory, provider);
			let router = new Contract(f.router, IUniswapv2Router02, provider);
			let pair = await factory.getPair(
				this.trade.tokenOut.id,
				wmatic,
			);
			pair !== zero ? pair : undefined;
			if (!pair) {
				console.log(
					"Pair not found for token: " + this.trade.tokenOut.id,
				);
				return undefined;
			}
			if (pair) {
				// find routerID using matching factory key (not property) from uniswapV2Factory:
				let factoryKey = Object.keys(uniswapV2Factory).find(
					(key) => uniswapV2Factory[key] === f.factory,
				);
				// console.log("Factory Key for Profit in WMATIC calculation: " + factoryKey);
				if (!factoryKey) {
					throw new Error(
						"Factory: " + f + " not found in uniswapV2Factory",
					);
				}
				let pairC = new Contract(pair, IPair, provider);
				let r = await pairC.liquidity();

				// console.log("Check bn conversion: ", r0, r1);
				let profitInWMATICBN: BN;
				if ((await pairC.token0()) === this.wmaticID) {
					profitInWMATICBN = await maxOut(
						this.tokenProfitBN,
						this.trade.tokenOut.id,
						this.trade.tokenIn.id,
					);
				}
				if ((await pairC.token1()) === this.wmaticID) {
					profitInWMATICBN = await maxOut(
						this.tokenProfitBN,
						this.trade.tokenIn.id,
						this.trade.tokenOut.id,
					);
				} else {
					return undefined;
				}
				let profitInWMATIC = pu(
					profitInWMATICBN.toFixed(this.trade.tokenOut.decimals),
					18,
				);
				// console.log(
				//     ">>>>[getProfitInWmatic]: profitInWMATICBN: ",
				//     profitInWMATICBN,
				//     " string: ",
				//     profitInWMATICBN.toFixed(18),
				//     " bigint: ",
				//     profitInWMATIC,
				//     " bigint string: ",
				//     fu(profitInWMATIC, 18),
				//     "<<<<<<<<<<<<<<<<<<<<<<<<<",
				// );
				return profitInWMATIC;
			}
			return undefined;
		}
	}

	// IF NEITHER TOKEN IS WMATIC, USE toWMATIC object to get gasToken -> WMATIC price.

	async gasTokentoWMATICPrice(): Promise<bigint | undefined> {
		const toWMATIC = await getGas2WMATICArray();
		let profitInWMATIC: bigint | undefined;
		let profitInWMATICBN: BN | undefined;
		let gasToken: ToWMATICPool;
		let gasWMATICPrice: BN;
		let profitString = "";

		for (gasToken of Object.values(toWMATIC)) {

			let irl = await getLeanIRLBN(
				gasToken.exchange,
				gasToken.tokenIn,
				gasToken.tokenOut,
				gasToken.liq,
				gasToken.id
			);



			if (gasToken.tokenIn.id == this.trade.tokenOut.id) {
				gasWMATICPrice = irl.price0
				profitInWMATICBN =
					this.tokenProfitBN.multipliedBy(gasWMATICPrice);
				profitString = profitInWMATICBN.toFixed(18);
				profitInWMATIC = pu(profitString, 18);
				return profitInWMATIC;
			}
			if (gasToken.tokenIn.id == this.trade.tokenIn.id) {
				gasWMATICPrice = irl.price1
				profitInWMATICBN =
					this.tokenProfitBN.multipliedBy(gasWMATICPrice);
				profitString = profitInWMATICBN.toFixed(18);
				profitInWMATIC = pu(profitString, 18);
				// console.log("profitInWMATIC: ", fu(profitInWMATIC, 18));
				return profitInWMATIC;
			}
			logger.info(
				"[gasTokentoWMATICPrice]: profitInWMATIC: ",
				profitString,
				"WMATIC",
			);
		}
		return undefined;
	}
}
function maxOut(tokenProfitBN: BN, r0: any, r1: any): BN | PromiseLike<BN> {
	throw new Error("Function not implemented.");
}

