// import { ethers, Contract } from 'ethers'
// import { PoolData } from '../getPoolData'
// import { BigNumber as BN } from 'bignumber.js'
// import { signer } from '../../../../constants/provider'
// import {
// 	ReservesData,
// 	PoolState,
// 	PoolInfo,
// 	ERC20token,
// 	Slot0,
// 	Reserves3,
// } from '../../../../constants/interfaces'
// import { abi as IERC20 } from '../../../../interfaces/IERC20.json'
// // import { sqrt } from '../tradeMath'
// import { BN2BigInt, BigInt2BN, fu, pu } from '../../../modules/convertBN'
// import { chainID } from '../../../../constants/addresses'
// import { TickMath, Position } from '@uniswap/v3-sdk'
// import { TickMath as TickMathAlg } from '@cryptoalgebra/integral-sdk'
// import { get } from 'http'
// import { slippageTolerance } from '../../control'
// import { log } from 'console'
// import { V3Quote } from '../price/v3Quote'
// // import { V3Quote } from './v3Quote'
// // import { token } from "../../../typechain-types/@openzeppelin/contracts";
// // import { getPrice } from "./uniswapV3Primer";
// /**
//  * @description
//  * For V3 this returns liquidity in range as well as pool 'state'.
//  *
//  */


// export interface Prices {
// 	exchange: string,
// 	ticker: string,
// 	priceOut: bigint,
// 	priceIn: bigint,
// }

// export class InRangeLiquidity {
// 	static liquidity: bigint[] = []
// 	poolInfo: PoolInfo
// 	pool: Contract
// 	token0: ERC20token
// 	token1: ERC20token
// 	token0Contract: Contract
// 	token1Contract: Contract
// 	constructor(
// 		poolInfo: PoolInfo,
// 		pool: Contract,
// 		token0: ERC20token,
// 		token1: ERC20token
// 	) {
// 		this.pool = pool
// 		this.poolInfo = poolInfo
// 		this.token0 = token0
// 		this.token1 = token1
// 		this.token0Contract = new Contract(token0.id, IERC20, signer)
// 		this.token1Contract = new Contract(token1.id, IERC20, signer)
// 	}

// 	async getSlot0(): Promise<Slot0> {
// 		let s0: Slot0 = {
// 			sqrtPriceX96: 0n,
// 			sqrtPriceX96BN: BN(0),
// 			tick: 0n,
// 			fee: 0n,
// 			unlocked: false,
// 		}
// 		try {
// 			if (this.poolInfo.protocol === 'UNIV3') {
// 				const slot0 = await this.pool.slot0()
// 				s0 = {
// 					sqrtPriceX96: slot0.sqrtPriceX96,
// 					sqrtPriceX96BN: BN(slot0.sqrtPriceX96.toString()),
// 					tick: slot0.tick,
// 					fee: await this.pool.fee(),
// 					unlocked: slot0.unlocked,
// 				}
// 				// console.log("Slot0: UNIV3", slot0)
// 				return s0
// 			} else if (this.poolInfo.protocol === 'ALG') {
// 				const slot0 = await this.pool.globalState()
// 				s0 = {
// 					sqrtPriceX96: slot0.price,
// 					sqrtPriceX96BN: BN(slot0.price.toString()),
// 					tick: slot0.tick,
// 					fee: slot0.fee,
// 					unlocked: slot0.unlocked,
// 				}
// 				// console.log("Slot0: ALG", s0)
// 				return s0
// 			}
// 		} catch (error: any) {
// 			console.log(
// 				'Error in ' +
// 				this.poolInfo.protocol +
// 				' getPoolState: ' +
// 				error.message
// 			)
// 			return s0
// 		}
// 		return s0
// 	}

// 	async getPriceBN(): Promise<{
// 		price: BN
// 		priceInBN: BN
// 		priceOutBN: BN
// 		priceInStr: string
// 		priceOutStr: string
// 	}> {
// 		const s0 = await this.getSlot0()
// 		// Calculate the price as (sqrtPriceX96^2) >> 96
// 		const price: BN = s0.sqrtPriceX96BN.pow(2).shiftedBy(-96)

// 		// Adjust for token decimals
// 		const priceIn: BN = price
// 			.times(BN(10).pow(this.token0.decimals))
// 			.dividedBy(BN(10).pow(this.token1.decimals))
// 		const priceOut: BN = BN(1).div(priceIn)

// 		// Convert to string with appropriate number of decimals
// 		const priceInString: string = priceIn.toFixed(this.token0.decimals)
// 		const priceOutString: string = priceOut.toFixed(this.token1.decimals)

// 		const prices = {
// 			price: price,
// 			priceInBN: priceIn,
// 			priceOutBN: priceOut,
// 			priceInStr: priceInString,
// 			priceOutStr: priceOutString,
// 		}
// 		return prices
// 	}

// 	async getTokenAmounts(): Promise<{
// 		amount0wei: number
// 		amount1wei: number
// 		inRangeReserves0: string
// 		inRangeReserves1: string
// 	}> {
// 		let amount0wei = 0;
// 		let amount1wei = 0;
// 		let inRangeReserves0 = '0';
// 		let inRangeReserves1 = '0';
// 		const liquidity: bigint = await this.pool.liquidity()
// 		if (liquidity === 0n) {
// 			console.log(
// 				'Liquidity is zero for ',
// 				this.token0.id,
// 				this.token1.id,
// 				' on ',
// 				this.poolInfo.exchange,
// 				'. Skipping...'
// 			)
// 			return {
// 				amount0wei,
// 				amount1wei,
// 				inRangeReserves0,
// 				inRangeReserves1,
// 			}
// 		} else {
// 			const slot0 = await this.getSlot0()
// 			const sqrtPriceX96 = slot0.sqrtPriceX96
// 			const Q96 = BigInt(2) ** 96n
// 			const sqrtPrice = Number((sqrtPriceX96 * Q96) / Q96)

// 			let currentTick: number = Number(slot0.tick)
// 			let tickspacing: number = Number(this.poolInfo.tickSpacing)

// 			// Can be used to isolate the range of ticks to calculate liquidity for
// 			let tickLow: number = (currentTick / tickspacing) * tickspacing
// 			let tickHigh: number = (currentTick / tickspacing) * tickspacing // + tickspacing;

// 			// This is a range of ticks that represent a percentage controlled by slippage
// 			//ref: https://discord.com/channels/597638925346930701/1090098983176773764/1090119292684599316
// 			//ref: https://discord.com/channels/597638925346930701/607978109089611786/1079836969519038494
// 			//ref: https://discord.com/channels/597638925346930701/607978109089611786/1037050094404501595
// 			// let tickLow = (Math.floor(currentTick / tickspacing)) * (tickspacing - (tickspacing * ticksForRange));
// 			// let tickHigh = ((Math.floor(currentTick / tickspacing)) * tickspacing) + (tickspacing + (tickspacing * ticksForRange));

// 			let sqrtRatioA = Math.sqrt(1.0001 ** tickLow)//.toFixed(18))
// 			let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh)//.toFixed(18))

// 			const liq: number = Number(liquidity)
// 			if (currentTick < tickLow) {
// 				amount0wei = Math.floor(
// 					liq *
// 					((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB))
// 				)
// 			}
// 			if (currentTick >= tickHigh) {
// 				amount1wei = Math.floor(liq * (sqrtRatioB - sqrtRatioA))
// 			}
// 			if (currentTick >= tickLow && currentTick < tickHigh) {
// 				amount0wei = Math.floor(
// 					liq *
// 					((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB))
// 				)
// 				amount1wei = Math.floor(liq * (sqrtPrice - sqrtRatioA))
// 			}

// 			let amount0Human = (
// 				amount0wei /
// 				10 ** this.token0.decimals
// 			).toFixed(this.token0.decimals)
// 			let amount1Human = (
// 				amount1wei /
// 				10 ** this.token1.decimals
// 			).toFixed(this.token1.decimals)

// 			const priceOfToken0 = 1 / (sqrtPrice * sqrtPrice);
// 			const priceOfToken1 = sqrtPrice * sqrtPrice;
// 			const price = {
// 				pool: this.token0.symbol + '/' + this.token1.symbol,
// 				exchange: this.poolInfo.exchange,
// 				sqrtRatioA: sqrtRatioA,
// 				sqrtRatioB: sqrtRatioB,
// 				sqrtPrice: sqrtPrice,
// 				price0: priceOfToken0,
// 				price1: priceOfToken1,
// 				liquidity: liquidity,
// 				tickLow: tickLow,
// 				tickHigh: tickHigh,
// 				amount0wei: amount0wei,
// 				amount1wei: amount1wei,
// 				amount0Human: amount0Human,
// 				amount1Human: amount1Human,
// 			}

// 			console.log(price)

// 			return {
// 				amount0wei: amount0wei,
// 				amount1wei: amount1wei,
// 				inRangeReserves0: amount0Human,
// 				inRangeReserves1: amount1Human,
// 			}
// 		}
// 	}

// 	async getReserves(): Promise<{ reserves0: bigint; reserves1: bigint }> {
// 		const reserves0 = await this.token0Contract.balanceOf(this.poolInfo.id)
// 		const reserves1 = await this.token1Contract.balanceOf(this.poolInfo.id)
// 		return { reserves0, reserves1 }
// 	}

// }
