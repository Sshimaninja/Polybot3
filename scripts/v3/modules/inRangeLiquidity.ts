import { ethers, utils, BigNumber, Contract } from "ethers";

import { BigNumber as BN } from "bignumber.js";
import { wallet } from '../../../constants/contract'
import { ReservesData, PoolState, PoolInfo, ERC20token, Slot0 } from "../../../constants/interfaces";
import { fu, pu } from "../../modules/convertBN";
// import { getPrice } from "./uniswapV3Primer";
/**
 * @description
 * For V3 this returns liquidity in range as well as pool 'state'.
 * 
 */

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

	async getSlot0(): Promise<Slot0> {
		let s0: Slot0 = {
			sqrtPriceX96: BigNumber.from(0),
			sqrtPriceX96BN: BN(0),
			tick: 0,
			fee: 0,
			unlocked: false,
		};
		try {
			if (this.poolInfo.protocol === 'UNIV3') {
				const slot0 = await this.pool.slot0();
				s0 = {
					sqrtPriceX96: slot0.sqrtPriceX96,
					sqrtPriceX96BN: BN(slot0.sqrtPriceX96.toString()),
					tick: slot0.tick,
					fee: this.pool.fee(),
					unlocked: slot0.unlocked,
				}
				// console.log("Slot0: UNIV3", slot0)
				return s0;
			} else if (this.poolInfo.protocol === 'ALG') {
				const slot0 = await this.pool.globalState();
				s0 = {
					sqrtPriceX96: slot0.price,
					sqrtPriceX96BN: BN(slot0.price.toString()),
					tick: slot0.tick,
					fee: slot0.fee,
					unlocked: slot0.unlocked,
				}
				// console.log("Slot0: ALG", s0)
				return s0;
			}
		} catch (error: any) {
			console.log("Error in " + this.poolInfo.protocol + " getPoolState: " + error.message)
			return s0;
		}
		return s0;
	};

	async getReservesInRange(): Promise<{ reserves0: BigNumber, reserves1: BigNumber }> {
		const slot0 = await this.getSlot0();

		let liq = await this.pool.liquidity();
		const reserves0 = liq.mul(slot0.sqrtPriceX96).div(BigNumber.from(2).pow(96));
		const reserves1 = liq.mul(BigNumber.from(2).pow(96)).div(slot0.sqrtPriceX96);

		return { reserves0, reserves1 };
	}

	// Using 'cumulative' data from slot0, calculate all reserves across all ticks
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

		// Calculate the price as (sqrtPriceX96 / 2^96)^2
		const price: BN = sqrtPriceX96.dividedBy(new BN(2).pow(96)).pow(2);

		// Adjust for token decimals
		const priceIn: BN = price.times(new BN(10).pow(decimal0)).dividedBy(new BN(10).pow(decimal1));
		const priceOut: BN = new BN(1).div(priceIn);

		// Convert to string with appropriate number of decimals
		const priceInString: string = priceIn.toFixed(decimal0);
		const priceOutString: string = priceOut.toFixed(decimal1);
		// const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(decimal0);

		const prices = {
			priceInBN: priceIn,
			priceOutBN: priceOut,
			priceIn: priceInString,
			priceOut: priceOutString
		}
		return prices
	}

	async getPoolState(): Promise<PoolState> {

		let s0 = await this.getSlot0();
		const slot0: Slot0 = {
			sqrtPriceX96: s0.sqrtPriceX96,
			sqrtPriceX96BN: s0.sqrtPriceX96BN,
			tick: s0.tick,
			fee: s0.fee,
			unlocked: s0.unlocked
		};

		const pBN = await this.getPriceBN(slot0.sqrtPriceX96BN, this.token0.decimals, this.token1.decimals)
		const prices = {
			// JS: pJS,
			BN: pBN,
		}
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
			priceIn: prices.BN.priceIn,
			priceOut: prices.BN.priceOut,
			priceInBN: prices.BN.priceInBN,
			priceOutBN: prices.BN.priceOutBN
		};
		const liquiditDataView = {
			poolID: this.pool.address,
			liquidity: liquidity.toString(),
			reserves0: fu(reserves0, this.token1.decimals),
			reserves1: fu(reserves1, this.token0.decimals),
			// reserves0BN: reserves0BN.toFixed(this.token0.decimals),
			// reserves1BN: reserves1BN.toFixed(this.token1.decimals),
			priceIn: prices.BN.priceIn,
			priceOut: prices.BN.priceOut,
			// priceInBN: prices.BN.priceInBN,
			// priceOutBN: prices.BN.priceOutBN,
		}
		// console.log(liquiditDataView)
		// console.log("Poolstate ", this.pool.address, " : ", this.poolInfo.protocol, " Complete")
		return liquidityData;
	}


};

