import { ethers, utils, BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as IPool } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { abi as IPoolState } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json';
import { wallet } from '../../../constants/contract'
import { ReservesData, PoolV3 } from "../../../constants/interfaces";
/**
 * @description
 * This class returns an array of an array of reserves for an array of pairs.
 * For V3 this also returns liquidity in range.
 */

/**
 * @description
 * This class returns an array of an array of reserves for an array of pairs.
 */
export class ReservesV3 {
	static reserves: ReservesData[] = [];

	constructor(match: PoolV3) {
		this.getReserves(match)
	}

	async getPoolIDs(pair: PoolV3): Promise<string[]> {
		const poolIDs: string[] = [];
		for (const key in pair) {
			if (key.startsWith("pool")) {
				const poolID = pair[key as keyof PoolV3];
				if (typeof poolID === "string") {
					poolIDs.push(poolID);
				}
			}
		}
		return poolIDs;
	}

	async getReserves(match: PoolV3): Promise<ReservesData[]> {
		const poolIDs = await this.getPoolIDs(match);
		const reserves: ReservesData[] = [];
		for (const poolID of poolIDs) {
			let pool = new ethers.Contract(poolID, IPool, wallet)
			if (pool.address != '0x0000000000000000000000000000000000000000') {
				const slot0Data = await pool.slot0();
				const [sqrtPriceX96, tick, , , , ,] = slot0Data;
				const reserveIn: BigNumber = tick > 0 ? sqrtPriceX96.mul(sqrtPriceX96).div(BigNumber.from(2).pow(192)) : sqrtPriceX96.mul(BigNumber.from(2).pow(96)).div(BigNumber.from(2).pow(192));
				const reserveOut: BigNumber = tick < 0 ? sqrtPriceX96.mul(sqrtPriceX96).div(BigNumber.from(2).pow(192)) : sqrtPriceX96.mul(BigNumber.from(2).pow(96)).div(BigNumber.from(2).pow(192));
				const reserveInBN = BN(utils.formatUnits(reserveIn, match.token0.decimals));
				const reserveOutBN = BN(utils.formatUnits(reserveOut, match.token1.decimals));
				const reserveData: ReservesData = {
					reserveIn,
					reserveOut,
					reserveInBN,
					reserveOutBN,
					blockTimestampLast: 0
				};
				reserves.push(reserveData);
			} else {
				console.log("Pool " + poolID + " no longer exists!")
			}
		}
		return reserves;
	}
}

export class InRangeLiquidity {
	static liquidity: BigNumber[] = [];

	constructor(match: PoolV3) {
		this.getLiquidity(match)
	}

	async getPoolIDs(pool: PoolV3): Promise<string[]> {
		const poolIDs: string[] = [];
		for (const key in pool) {
			if (key.startsWith("pool")) {
				const poolID = pool[key as keyof PoolV3];
				if (typeof poolID === "string") {
					poolIDs.push(poolID);
				}
			}
		}
		return poolIDs;
	}

	/*
	liquidity0 = liquidity * sqrtPriceX96 / 2 ** 96
	liquidity1 = liquidity * 2 ** 96 / sqrtPriceX96 
	 */

	async getLiquidity(match: PoolV3): Promise<BigNumber[]> {
		const poolIDs = await this.getPoolIDs(match);
		const liquidityArray: BigNumber[] = [];
		for (const poolID of poolIDs) {
			let pool = new ethers.Contract(poolID, IPoolState, wallet);
			if (pool.address != '0x0000000000000000000000000000000000000000') {
				const liquidity = await pool.liquidity();
				const [sqrtPriceX96, , , , , ,] = await pool.slot0();
				let liquidity0 = liquidity.mul(sqrtPriceX96).div(BigNumber.from(2).pow(96));
				let liquidity1 = liquidity.mul(BigNumber.from(2).pow(96)).div(sqrtPriceX96);
				console.log("liquidity0: ", liquidity0.toString());
				console.log("liquidity1: ", liquidity1.toString());
				liquidityArray.push(liquidity0, liquidity1);
				return liquidityArray;
			}
		}
		console.log("Pool for >" + match.ticker + "< no longer exists!")
		return liquidityArray;
	}

};


