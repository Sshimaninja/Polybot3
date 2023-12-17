import { ethers, utils, BigNumber, Contract } from "ethers";
import { PoolData } from "./getPoolData";
import { BigNumber as BN } from "bignumber.js";
import { wallet } from '../../../constants/contract'
import { ReservesData, PoolState, PoolInfo, ERC20token, Slot0, Reserves3 } from "../../../constants/interfaces";
import { abi as IERC20 } from "../../../interfaces/IERC20.json";
import { sqrt } from "./tradeMath";
import { BN2JS, fu, pu } from "../../modules/convertBN";
import { chainID } from "../../../constants/addresses";
import { TickMath, Position } from "@uniswap/v3-sdk";
import { TickMath as TickMathAlg } from "@cryptoalgebra/integral-sdk";
import { get } from "http";
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
	token0Contract: Contract;
	token1Contract: Contract;
	constructor(poolInfo: PoolInfo, pool: Contract, token0: ERC20token, token1: ERC20token) {
		this.pool = pool;
		this.poolInfo = poolInfo;
		this.token0 = token0;
		this.token1 = token1;
		this.token0Contract = new Contract(token0.id, IERC20, wallet);
		this.token1Contract = new Contract(token1.id, IERC20, wallet);
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

	async getPriceBN(): Promise<{ price: BN, priceInBN: BN, priceOutBN: BN, priceInStr: string, priceOutStr: string }> {

		const s0 = await this.getSlot0();
		// Calculate the price as (sqrtPriceX96 / 2^96)^2
		const price: BN = s0.sqrtPriceX96BN.dividedBy(BN(2).pow(96)).pow(2);

		// Adjust for token decimals
		//price0 = price * (10 ** this.token0.decimals) / (10 ** this.token1.decimals);
		//price1 = 1 / price0;
		const priceIn: BN = price.times(BN(10).pow(this.token0.decimals)).dividedBy(BN(10).pow(this.token1.decimals));
		const priceOut: BN = BN(1).div(priceIn);

		// Convert to string with appropriate number of decimals
		const priceInString: string = priceIn.toFixed(this.token0.decimals);
		const priceOutString: string = priceOut.toFixed(this.token1.decimals);
		// const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(decimal0);

		const prices = {
			price: price,
			priceInBN: priceIn,
			priceOutBN: priceOut,
			priceInStr: priceInString,
			priceOutStr: priceOutString
		}
		return prices
	}


	async getReserves(): Promise<{ reserves0: BigNumber, reserves1: BigNumber }> {
		const reserves0 = await this.token0Contract.balanceOf(this.poolInfo.id);
		const reserves1 = await this.token1Contract.balanceOf(this.poolInfo.id);
		return { reserves0, reserves1 }
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

		const p = await this.getPriceBN()
		const liquidity = await this.pool.liquidity();

		let r = await this.getReserves();

		const liquidityData: PoolState = {
			poolID: this.pool.address,
			sqrtPriceX96: slot0.sqrtPriceX96,
			liquidity: liquidity,
			liquidityBN: BN(liquidity.toString()),
			reservesIn: r.reserves0,
			reservesOut: r.reserves1,
			reservesInBN: BN(fu(r.reserves0, this.token0.decimals)),
			reservesOutBN: BN(fu(r.reserves1, this.token1.decimals)),
			priceIn: p.priceInStr,
			priceOut: p.priceOutStr,
			priceInBN: p.priceInBN,
			priceOutBN: p.priceOutBN,
		};

		// await this.viewData(liquidityData);
		return liquidityData;
	}

	async viewData(l: PoolState) {
		const liquidityDataView = {
			ticker: this.token0.symbol + "/" + this.token1.symbol,
			poolID: this.pool.address,
			liquidity: l.liquidity.toString(),
			// liquidity: liquidity.toString(),
			// reserves0: r.reserves0,
			// reserves1: r.reserves1,
			// reserves0BN: r.reserves0BN,
			// reserves1BN: r.reserves1BN,
			reserves0: l.reservesIn,
			reserves1: l.reservesOut,
			reserves0String: fu(l.reservesIn, this.token0.decimals),
			reserves1String: fu(l.reservesOut, this.token1.decimals),
			priceIn: l.priceIn,
			priceOut: l.priceOut,
			// priceInBN: prices.BN.priceInBN,
			// priceOutBN: prices.BN.priceOutBN,
		}
		console.log('liquiditydataview: ')
	}
}
