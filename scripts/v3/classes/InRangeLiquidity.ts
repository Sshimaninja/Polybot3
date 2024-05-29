import { ethers, Contract } from 'ethers'
// import { PoolData } from '../getPoolData'
import { BigNumber as BN } from 'bignumber.js'
import { signer } from '../../../constants/provider'
import {
	ReservesData,
	PoolStateV3,
	PoolInfo,
	ERC20token,
	Slot0,
	Reserves3,
} from '../../../constants/interfaces'
import { abi as IERC20 } from '../../../interfaces/IERC20.json'
// import { sqrt } from '../tradeMath'
import { BN2BigInt, BigInt2BN, fbi, fu, pu } from '../../modules/convertBN'
import { chainID } from '../../../constants/addresses'
import { TickMath, Position } from '@uniswap/v3-sdk'
import { TickMath as TickMathAlg } from '@cryptoalgebra/integral-sdk'
import { get } from 'http'
import { slippageTolerance } from '../control'
import { log } from 'console'
import { V3Quote } from '../modules/price/v3Quote'
import { IRLBN, getIRLBN, } from '../modules/price/getIRLBN'
import { IRLbigint, getIRLbigint } from '../modules/price/getIRLbigint'
// import { V3Quote } from './v3Quote'
// import { token } from "../../../typechain-types/@openzeppelin/contracts";
// import { getPrice } from "./uniswapV3Primer";
/**
 * @description
 * For V3 this returns liquidity in range as well as pool 'state'.
 *
 */

export interface IRL {
	pool: string,
	fee: number,
	exchange: string,
	sqrtRatioLow: number,
	sqrtRatioHigh: number,
	sqrtPrice: number,
	price0: number,
	price1: number,
	liquidity: bigint,
	tickLow: number,
	tickHigh: number,
	tickSpacing: number,
	reserves0: bigint,
	reserves1: bigint,
	//reserves0Wei: number,
	//reserves1Wei: number,
	//reserves0Human: string,
	//reserves1Human: string,
}

//export interface V3Reserves {
//	reserves0Wei: number
//	reserves1Wei: number
//	inRangeReserves0: string,
//	inRangeReserves1: string
//}

export interface Prices {
	exchange: string,
	ticker: string,
	priceOut: bigint,
	priceIn: bigint,
}

export class InRangeLiquidity {
	static liquidity: bigint[] = []
	poolInfo: PoolInfo
	pool: Contract
	token0: ERC20token
	token1: ERC20token
	token0Contract: Contract
	token1Contract: Contract
	constructor(
		poolInfo: PoolInfo,
		pool: Contract,
		token0: ERC20token,
		token1: ERC20token
	) {
		this.pool = pool
		this.poolInfo = poolInfo
		this.token0 = token0
		this.token1 = token1
		this.token0Contract = new Contract(token0.id, IERC20, signer)
		this.token1Contract = new Contract(token1.id, IERC20, signer)
	}

	async getIRL(): Promise<IRL> {

		const slot0 = await this.getSlot0()
		const sqrtPriceX96 = slot0.sqrtPriceX96
		const Q96 = 2n ** 96n
		const sqrtPrice = Number((sqrtPriceX96 * Q96) / Q96)

		let currentTick: number = Number(slot0.tick)
		let tickspacing: number = Number(this.poolInfo.tickSpacing)

		// Can be used to isolate the range of ticks to calculate liquidity for
		let tickLow: number = Math.floor(currentTick / tickspacing) * tickspacing
		let tickHigh: number = Math.ceil(currentTick / tickspacing) * tickspacing + tickspacing;

		// This is a range of ticks that represent a percentage controlled by slippage
		//ref: https://discord.com/channels/597638925346930701/1090098983176773764/1090119292684599316
		//ref: https://discord.com/channels/597638925346930701/607978109089611786/1079836969519038494
		//ref: https://discord.com/channels/597638925346930701/607978109089611786/1037050094404501595
		// let tickLow = (Math.floor(currentTick / tickspacing)) * (tickspacing - (tickspacing * ticksForRange));
		// let tickHigh = ((Math.floor(currentTick / tickspacing)) * tickspacing) + (tickspacing + (tickspacing * ticksForRange));

		let sqrtRatioLow = Math.sqrt(1.0001 ** tickLow)//.toFixed(18))
		let sqrtRatioHigh = Math.sqrt(1.0001 ** tickHigh)//.toFixed(18))
		const liquidity: bigint = await this.pool.liquidity()
		const liq: number = Number(liquidity)
		let reserves0Wei: number = 0
		let reserves1Wei: number = 0
		let r: IRL = {
			pool: this.token0.symbol + '/' + this.token1.symbol,
			fee: this.poolInfo.fee,
			exchange: this.poolInfo.exchange,
			sqrtRatioLow: sqrtRatioLow,
			sqrtRatioHigh: sqrtRatioHigh,
			sqrtPrice: sqrtPrice,
			price0: 0,
			price1: 0,
			liquidity: liquidity,
			tickLow: tickLow,
			tickHigh: tickHigh,
			tickSpacing: this.poolInfo.tickSpacing,
			reserves0: 0n,
			reserves1: 0n,
		}
		if (liquidity === 0n) {
			console.log(
				'Liquidity is zero for ',

				this.token0.id,
				this.token1.id,
				' on ',
				this.poolInfo.exchange,
				'. Skipping...'
			)
			return r
		} else {
			if (currentTick < tickLow) {
				reserves0Wei = Math.floor(
					liq *
					((sqrtRatioHigh - sqrtRatioLow) / (sqrtRatioLow * sqrtRatioHigh))
				)
			}
			if (currentTick >= tickHigh) {
				reserves1Wei = Math.floor(liq * (sqrtRatioHigh - sqrtRatioLow))
			}
			if (currentTick >= tickLow && currentTick < tickHigh) {
				reserves0Wei = Math.floor(
					liq *
					((sqrtRatioHigh - sqrtPrice) / (sqrtPrice * sqrtRatioHigh))
				)
				reserves1Wei = Math.floor(liq * (sqrtPrice - sqrtRatioLow))
			}

			r.price0 = 1 / (sqrtPrice * sqrtPrice);
			r.price1 = sqrtPrice * sqrtPrice;

			r.reserves0 = BigInt(reserves0Wei)
			r.reserves1 = BigInt(reserves1Wei)
			//console.log(r)
			return r
		}

	}

	async getIRLBN(): Promise<IRLBN> {
		return await getIRLBN(
			await this.getSlot0(),
			this.poolInfo,
			this.token0,
			this.token1,
			await this.pool.liquidity()
		)
	}

	async getIRLbigint(): Promise<IRLbigint> {
		return await getIRLbigint(
			await this.getSlot0(),
			this.poolInfo,
			this.token0,
			this.token1,
			0,
			await this.pool.liquidity()
		)
	}

	async getSlot0(): Promise<Slot0> {
		let s0: Slot0 = {
			sqrtPriceX96: 0n,
			tick: 0,
			fee: 0,
			unlocked: false,
		}
		try {
			if (this.poolInfo.protocol === 'UNIV3') {
				const slot0 = await this.pool.slot0()
				s0 = {
					sqrtPriceX96: slot0.sqrtPriceX96,
					tick: slot0.tick,
					fee: await this.pool.fee(),
					unlocked: slot0.unlocked,
				}
				// console.log("Slot0: UNIV3", slot0)
				return s0
			} else if (this.poolInfo.protocol === 'ALG') {
				const slot0 = await this.pool.globalState()
				s0 = {
					sqrtPriceX96: slot0.price,
					tick: slot0.tick,
					fee: slot0.fee,
					unlocked: slot0.unlocked,
				}
				// console.log("Slot0: ALG", s0)
				return s0
			}
		} catch (error: any) {
			console.log(
				'Error in ' +
				this.poolInfo.protocol +
				' getPoolState: ' +
				error.message
			)
			return s0
		}
		return s0
	}


	// async getReserves(): Promise<{ reserves0: bigint; reserves1: bigint }> {
	// 	const reserves0 = await this.token0Contract.balanceOf(this.poolInfo.id)
	// 	const reserves1 = await this.token1Contract.balanceOf(this.poolInfo.id)
	// 	return { reserves0, reserves1 }
	// }

}
