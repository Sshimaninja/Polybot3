import { ethers, utils, BigNumber, Contract } from "ethers";

import { BigNumber as BN } from "bignumber.js";
import { wallet } from '../../../constants/contract'
import { ReservesData, PoolState, PoolInfo, ERC20token } from "../../../constants/interfaces";
import { fu, pu } from "../../modules/convertBN";
// import { getPrice } from "./uniswapV3Primer";
/**
 * @description
 * This class returns an array of an array of reserves for an array of pairs.
 * For V3 this also returns liquidity in range.
 */

/**
 * @description
 * This class returns an array of an array of reserves for an array of pairs.
 */

// export class ReservesV3 {
// 	static reserves: ReservesData[] = [];

// 	constructor(pool: Contract) {
// 		this.getReserves(pool)
// 	}

// 	async getPoolIDs(pair: Contract): Promise<string[]> {
// 		const poolIDs: string[] = [];
// 		for (const key in pair) {
// 			if (key.startsWith("pool")) {
// 				const poolID = pair[key as keyof Contract];
// 				if (typeof poolID === "string") {
// 					poolIDs.push(poolID);
// 				}
// 			}
// 		}
// 		return poolIDs;
// 	}

// 	async getReserves(pool: Contract): Promise<ReservesData[]> {
// 		const poolIDs = await this.getPoolIDs(pool);
// 		const reserves: ReservesData[] = [];
// 		for (const poolID of poolIDs) {
// 			let pool = new ethers.Contract(poolID, IPool, wallet)
// 			if (pool.address != '0x0000000000000000000000000000000000000000') {
// 				const slot0Data = await pool.slot0();
// 				const [sqrtPriceX96, tick, , , , ,] = slot0Data;
// 				const reserveIn: BigNumber = tick > 0 ? sqrtPriceX96.mul(sqrtPriceX96).div(BigNumber.from(2).pow(192)) : sqrtPriceX96.mul(BigNumber.from(2).pow(96)).div(BigNumber.from(2).pow(192));
// 				const reserveOut: BigNumber = tick < 0 ? sqrtPriceX96.mul(sqrtPriceX96).div(BigNumber.from(2).pow(192)) : sqrtPriceX96.mul(BigNumber.from(2).pow(96)).div(BigNumber.from(2).pow(192));
// 				const reserveInBN = BN(utils.formatUnits(reserveIn, pool.token0.decimals));
// 				const reserveOutBN = BN(utils.formatUnits(reserveOut, pool.token1.decimals));
// 				const reserveData: ReservesData = {
// 					reserveIn,
// 					reserveOut,
// 					reserveInBN,
// 					reserveOutBN,
// 					blockTimestampLast: 0
// 				};
// 				reserves.push(reserveData);
// 			} else {
// 				console.log("Pool " + poolID + " no longer exists!")
// 			}
// 		}
// 		return reserves;
// 	}
// }

export class InRangeLiquidity {
	static liquidity: BigNumber[] = [];
	poolInfo: PoolInfo;
	pool: Contract;
	token0: ERC20token;
	token1: ERC20token;

	constructor(poolInfo: PoolInfo, pool: Contract, token0: ERC20token, token1: ERC20token) {
		this.pool = pool;
		this.poolInfo = poolInfo;
		this.token0 = token0;
		this.token1 = token1;
	}

	async getReservesInRange(): Promise<{ reserves0: BigNumber, reserves1: BigNumber }> {
		const slot0 = await this.pool.slot0()

		let liq = await this.pool.liquidity();
		const reserves0 = liq.mul(slot0.sqrtPriceX96).div(BigNumber.from(2).pow(96));
		const reserves1 = liq.mul(BigNumber.from(2).pow(96)).div(slot0.sqrtPriceX96);

		return { reserves0, reserves1 };
	}

	async getTotalReserves(): Promise<{ reserves0: BigNumber, reserves1: BigNumber }> {
		// Get the current state of the pool
		const [secondsAgo, tickCumulatives, liquidityCumulatives] = await this.pool.observe([0]);
		console.log("Seconds Ago: ", secondsAgo[0].toString())
		console.log("Tick Cumulatives: ", tickCumulatives[0].toString())
		console.log("Liquidity Cumulatives: ", liquidityCumulatives[0].toString())

		// The current tick cumulative and liquidity cumulative are the first elements of the returned arrays
		const currentTickCumulative = tickCumulatives[0];
		const currentLiquidityCumulative = liquidityCumulatives[0];

		// The current tick and liquidity can be calculated from the cumulatives
		const currentTick = currentTickCumulative.div(ethers.BigNumber.from(secondsAgo[0]));
		const currentLiquidity = currentLiquidityCumulative.div(ethers.BigNumber.from(secondsAgo[0]));

		// The reserves can be calculated from the current tick and liquidity
		const reserves0 = currentLiquidity.mul(BigNumber.from(1).sub(currentTick));
		const reserves1 = currentLiquidity.mul(currentTick);

		return { reserves0, reserves1 };
	}

	async getPriceBN(sqrtPriceX96: BN, decimal0: number, decimal1: number): Promise<{ priceInBN: BN, priceOutBN: BN, priceIn: string, priceOut: string }> {

		// const buyOneOfToken0 = ((sqrtPriceX96 / 2 ** 96) ** 2) 
		const price: BN = BN((sqrtPriceX96.div(BN(2).toExponential(96))).toExponential(2))
		// const price = sqrtPrice.toExponential(2)

		//const price0 = price / (10 ** decimal1 / 10 ** decimal0).toFixed(decimal1);
		const priceIn: BN = price.dividedBy(BN(10).toExponential(decimal1)).dividedBy(BN(10).toExponential(decimal0));
		const priceInString: string = priceIn.toFixed(decimal1);

		const priceOut: BN = (BN(1).div(priceIn));
		const priceOutString: string = priceOut.toFixed(decimal0);

		// const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(decimal0);

		const prices = {
			priceInBN: priceIn,
			priceOutBN: priceOut,
			priceIn: priceInString,
			priceOut: priceOutString
		}
		return prices
	}

	async getPriceJS(sqrtPriceX96: BigNumber, decimal0: number, decimal1: number): Promise<{ priceInJS: BigNumber, priceOutJS: BigNumber, priceIn: string, priceOut: string }> {
		const price: BigNumber = sqrtPriceX96.div(BigNumber.from(2).pow(96)).pow(2);

		const priceIn: BigNumber = price.div(BigNumber.from(10).pow(decimal1)).div(BigNumber.from(10).pow(decimal0));
		const priceInString: string = fu(priceIn, decimal1);
		console.log(priceIn)
		console.log("PriceInString: ", priceInString)

		const priceOut: BigNumber = (BigNumber.from(1).div(priceIn));
		const priceOutString: string = fu(priceOut, decimal0);

		const prices = {
			priceInJS: priceIn,
			priceOutJS: priceOut,
			priceIn: priceInString,
			priceOut: priceOutString
		}
		return prices
	}


	async getPoolState(): Promise<PoolState> {
		const s0 = this.poolInfo.protocol === 'UNIV3' ? await this.pool.slot0() : await this.pool.globalState();
		const slot0 = this.poolInfo.protocol === 'UNIV3' ? {
			sqrtPriceX96: s0.sqrtPriceX96,
			sqrtPriceX96BN: BN(s0.sqrtPriceX96.toString()),
			tick: s0.tick,
			fee: s0.fee,
			locked: s0.unlocked
		} : {
			sqrtPriceX96: s0.sqrtPriceX96,
			sqrtPriceX96BN: BN(s0.sqrtPriceX96.toString()),
			tick: s0.tick,
			// fee0Z: s0.feeOtZ,
			fee: s0.feeZtO, //simplified for uniformity, as both Algebra changes fee per direction, but this bot currently only trades in one direction.
			locked: s0.unlocked
		}

		const pBN = await this.getPriceBN(slot0.sqrtPriceX96BN, this.token0.decimals, this.token1.decimals)
		const pJS = await this.getPriceJS(slot0.sqrtPriceX96, this.token0.decimals, this.token1.decimals)
		console.log("[getPoolState]: >>>>>>>>>>>>>>>Formatted Prices: ")
		const prices = {
			JS: pJS,
			BN: pBN,
		}
		// prices.priceTokenInBN = BN(fu(prices.priceTokenIn, this.token0.decimals));
		// prices.priceTokenOutBN = BN(fu(prices.priceTokenOut, this.token1.decimals));

		console.log('[InRangeLiquidity]: slot0: ')
		console.log(slot0)
		console.log('[InRangeLiquidity]: prices: ')
		console.log(prices)
		// if (this.pool.address != '0x0000000000000000000000000000000000000000' || this.pool.address != '0x0000000000000000000000000000000000000000') {
		// console.log("Getting Poolstate for ", this.pool.address)
		const liquidity = await this.pool.liquidity();

		const { reserves0, reserves1 } = await this.getReservesInRange();
		const { reserves0BN, reserves1BN } = { reserves0BN: BN(utils.formatUnits(reserves0, this.token0.decimals)), reserves1BN: BN(utils.formatUnits(reserves1, this.token1.decimals)) };


		const liquidityData: PoolState = {
			poolID: this.pool.address,
			sqrtPriceX96: slot0.sqrtPriceX96,
			liquidity: liquidity,
			liquidityBN: BN(liquidity.toString()),
			reserveIn: reserves0,
			reserveOut: reserves1,
			reserveInBN: reserves0BN,
			reserveOutBN: reserves1BN,
			priceIn: prices.JS.priceInJS,
			priceOut: prices.JS.priceOutJS,
			priceInBN: prices.BN.priceInBN,
			priceOutBN: prices.BN.priceOutBN
		};
		const liquiditDataView = {
			poolID: this.pool.address,
			liquidity: liquidity.toString(),
			reserves0: fu(reserves0, this.token0.decimals),
			reserves1: fu(reserves1, this.token1.decimals),
			reserves0BN: reserves0BN.toFixed(this.token0.decimals),
			reserves1BN: reserves1BN.toFixed(this.token1.decimals),
			priceIn: prices.JS.priceIn,
			priceOut: prices.JS.priceOut,
			priceInBN: prices.BN.priceIn,
			priceOutBN: prices.BN.priceOutBN,
		}
		console.log(liquiditDataView)
		console.log("Poolstate ", this.pool.address, " Complete")
		return liquidityData;
	}


};

