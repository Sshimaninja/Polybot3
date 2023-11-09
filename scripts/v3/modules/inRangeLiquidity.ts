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
	protocol: string;
	pool: Contract;

	constructor(protocol: string, pool: Contract) {
		this.pool = pool;
		this.protocol = protocol;
	}
	/*
	liquidity0 = liquidity * sqrtPriceX96 / 2 ** 96
	liquidity1 = liquidity * 2 ** 96 / sqrtPriceX96 
	 */
	async getSqrtRatioAtTick(tick: number): Promise<BigNumber> {
		const sqrtPriceX96 = Math.pow(1.0001, tick) * Math.pow(2, 96);
		return BigNumber.from(sqrtPriceX96.toFixed(0));
	}


	async getReserves(slot0: any): Promise<{ reserves0: BigNumber, reserves1: BigNumber }> {
		let tickSpacing = await this.pool.tickSpacing();
		let tickLower = Math.floor(slot0.tick / tickSpacing) * tickSpacing;
		let tickUpper = tickLower + tickSpacing;

		let sqrtPriceX96Lower = await this.getSqrtRatioAtTick(tickLower);
		let sqrtPriceX96Upper = await this.getSqrtRatioAtTick(tickUpper);

		let liquidityInRange = await this.pool.liquidity({ tickLower, tickUpper });

		let reserves0 = liquidityInRange.mul(sqrtPriceX96Upper.sub(sqrtPriceX96Lower)).div(BigNumber.from(2).pow(96));
		let reserves1 = liquidityInRange.mul(BigNumber.from(2).pow(96)).div(sqrtPriceX96Upper.sub(sqrtPriceX96Lower));

		return { reserves0, reserves1 };
	}

	async getPoolState(): Promise<PoolState> {
		const s0 = this.protocol === 'UNI' ? await this.pool.slot0() : await this.pool.globalState();
		const slot0 = this.protocol === 'UNI' ? {
			sqrtPriceX96: s0.sqrtPriceX96,
			tick: s0.tick,
			fee: s0.fee,
			locked: s0.unlocked
		} : {
			sqrtPriceX96: s0.sqrtPriceX96,
			tick: s0.tick,
			// fee0Z: s0.feeOtZ,
			fee: s0.feeZtO, //simplified for uniformity, as both Algebra changes fee per direction, but this bot currently only trades in one direction.
			locked: s0.unlocked
		}
		// if (this.pool.address != '0x0000000000000000000000000000000000000000' || this.pool.address != '0x0000000000000000000000000000000000000000') {
		// console.log("Getting Poolstate for ", this.pool.address)
		const liquidity = await this.pool.liquidity();

		const { reserves0, reserves1 } = await this.getReserves(slot0);

		const { reserves0String, reserves1String } = { reserves0String: fu(reserves0, this.pool.token0.decimals), reserves1String: fu(reserves1, this.pool.token1.decimals) };

		let reserves0BN = BN(reserves0String);
		let reserves1BN = BN(reserves1String);

		let price0BN = reserves1BN.multipliedBy((2).toExponential(96)).div(reserves0BN.sqrt());
		let price1BN = reserves0BN.multipliedBy((2).toExponential(96)).div(reserves1BN.sqrt());

		const liquidityData: PoolState = {
			poolID: this.pool.address,
			sqrtPriceX96: slot0.sqrtPriceX96,
			liquidity: liquidity,
			reserveIn: reserves0,
			reserveOut: reserves1,
			reserveInBN: reserves0BN,
			reserveOutBN: reserves1BN,
			priceInBN: price0BN,
			priceOutBN: price1BN
		};
		const liquiditDataView = {
			poolID: this.pool.address,
			liquidity: liquidity.toString(),
			reserves0: fu(reserves0, this.pool.token0.decimals),
			reserves1: fu(reserves1, this.pool.token1.decimals),
			reserves0BN: reserves0BN.toFixed(this.pool.token0.decimals),
			reserves1BN: reserves1BN.toFixed(this.pool.token1.decimals),
			price0BN: price0BN.toFixed(this.pool.token0.decimals),
			price1BN: price1BN.toFixed(this.pool.token1.decimals)
		}
		console.log(liquiditDataView)
		console.log("Poolstate ", this.pool.address, " Complete")
		return liquidityData;
	}

};

