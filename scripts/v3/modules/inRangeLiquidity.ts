import { ethers, utils, BigNumber, Contract } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { wallet } from '../../../constants/contract'
import { ReservesData, PoolState } from "../../../constants/interfaces";
import { fu } from "../../modules/convertBN";
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
	pool: Contract;

	constructor(pool: Contract) {
		this.pool = pool;
	}
	/*
	liquidity0 = liquidity * sqrtPriceX96 / 2 ** 96
	liquidity1 = liquidity * 2 ** 96 / sqrtPriceX96 
	 */



	async getPoolState(): Promise<PoolState> {
		let slot0;
		let sqrtPriceX96: BigNumber;
		try {
			slot0 = await this.pool.slot0();
			sqrtPriceX96 = slot0.sqrtPriceX96;

		} catch (error: any) {
			slot0 = await this.pool.globalState();
			sqrtPriceX96 = slot0.price;
		}
		// if (this.pool.address != '0x0000000000000000000000000000000000000000' || this.pool.address != '0x0000000000000000000000000000000000000000') {
		// console.log("Getting Poolstate for ", this.pool.address)
		const liquidity = await this.pool.liquidity();

		let reserves0 = liquidity.mul(sqrtPriceX96).div(BigNumber.from(2).pow(96));
		let reserves1 = liquidity.mul(BigNumber.from(2).pow(96)).div(sqrtPriceX96);

		let reserves0BN = BN(fu(reserves0, this.pool.token0.decimals));
		let reserves1BN = BN(fu(reserves1, this.pool.token1.decimals));

		let price0BN = reserves1BN.div(reserves0BN);
		let price1BN = reserves0BN.div(reserves1BN);

		const liquidityData: PoolState = {
			poolID: this.pool.address,
			sqrtPriceX96: sqrtPriceX96,
			liquidity: liquidity,
			reserveIn: reserves0,
			reserveOut: reserves1,
			reserveInBN: reserves0BN,
			reserveOutBN: reserves1BN,
			priceInBN: price0BN,
			priceOutBN: price1BN
		};
		// if (reserves0.isZero() || reserves1.isZero()) {
		// 	// console.log("Pool for >" + this.pool.address + "< no longer exists!")
		// 	return;
		// } else {
		// const liquiditDataView = {
		// 	poolID: this.pool.address,
		// 	liquidity: liquidity.toString(),
		// 	reserves0: fu(reserves0, this.pool.token0.decimals),
		// 	reserves1: fu(reserves1, this.pool.token1.decimals),
		// 	reserves0BN: reserves0BN.toFixed(this.pool.token0.decimals),
		// 	reserves1BN: reserves1BN.toFixed(this.pool.token1.decimals),
		// 	price0BN: price0BN.toFixed(this.pool.token0.decimals),
		// 	price1BN: price1BN.toFixed(this.pool.token1.decimals)
		// }
		// console.log(liquiditDataView)
		// console.log("Poolstate ", this.pool.address, " Complete")
		return liquidityData;
	}

};

