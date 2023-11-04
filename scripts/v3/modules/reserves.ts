import { ethers, utils, BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as IPool } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { abi as IPoolState } from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json';
import { wallet } from '../../../constants/contract'
import { ReservesData, } from "../../../constants/interfaces";
/**
 * @description
 * This class returns an array of an array of reserves for an array of pairs.
 * For V3 this also returns liquidity in range.
 */

/**
 * @description
 * This class returns an array of an array of reserves for an array of pairs.
 */

//Interfaces:
export interface V3Matches {
	exchangeA: string;
	exchangeB: string;
	matches: Match3Pools[];
}

export interface Match3Pools {
	ticker: string;
	poolID0: {
		// exchange: string,
		// factory: Promise<Contract>,
		id: string,
		tickSpacing: number
		fee: number
	}
	poolID1: {
		// exchange: string,
		// factory: Promise<Contract>,
		id: string,
		tickSpacing: number
		fee: number
	}
	token0: {
		// contract: Contract,
		id: string,
		symbol: string,
		decimals: number
	}
	token1: {
		// contract: Contract,
		id: string,
		symbol: string,
		decimals: number
	}
}



export class ReservesV3 {
	static reserves: ReservesData[] = [];

	constructor(match: Match3Pools) {
		this.getReserves(match)
	}

	async getPoolIDs(pair: Match3Pools): Promise<string[]> {
		const poolIDs: string[] = [];
		for (const key in pair) {
			if (key.startsWith("pool")) {
				const poolID = pair[key as keyof Match3Pools];
				if (typeof poolID === "string") {
					poolIDs.push(poolID);
				}
			}
		}
		return poolIDs;
	}

	async getReserves(match: Match3Pools): Promise<ReservesData[]> {
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
	match: Match3Pools;

	constructor(match: Match3Pools) {
		this.match = match;
	}
	/*
	liquidity0 = liquidity * sqrtPriceX96 / 2 ** 96
	liquidity1 = liquidity * 2 ** 96 / sqrtPriceX96 
	 */

	async getLiquidity(): Promise<BigNumber[]> {
		const liquidityArray: BigNumber[] = [];
		for (const pools of [this.match]) {
			// console.log('enter loop poolID: ', pools.poolID0.id)
			let poolA = new ethers.Contract(pools.poolID0.id, IPoolState, wallet);
			let poolB = new ethers.Contract(pools.poolID1.id, IPoolState, wallet);

			if (poolA.address != '0x0000000000000000000000000000000000000000' || poolB.address != '0x0000000000000000000000000000000000000000') {
				const liquidityA = await poolA.liquidity();
				const [sqrtPriceX96, , , , , ,] = await poolA.slot0();

				let liquidityA0 = liquidityA.mul(sqrtPriceX96).div(BigNumber.from(2).pow(96));
				let liquidityA1 = liquidityA.mul(BigNumber.from(2).pow(96)).div(sqrtPriceX96);

				let liquidityB0 = liquidityA.mul(sqrtPriceX96).div(BigNumber.from(2).pow(96));
				let liquidityB1 = liquidityA.mul(BigNumber.from(2).pow(96)).div(sqrtPriceX96);

				console.log("liquidityA0: ", liquidityA0.toString());
				console.log("liquidityA1: ", liquidityA1.toString());
				console.log("liquidityB0: ", liquidityB0.toString());
				console.log("liquidityB1: ", liquidityB1.toString());

				if (liquidityA0.isZero() || liquidityA1.isZero()) {
					console.log("Pool for >" + poolA.address + "< no longer exists!")
				} else {
					liquidityArray.push(liquidityA0, liquidityA1, liquidityB0, liquidityB1);

					return liquidityArray;
				}
			}
			console.log(liquidityArray);
			// console.log("Pool for >" + this.match.ticker + "< no longer exists!")
			// return liquidityArray;
		}
		return liquidityArray;
	}
};

