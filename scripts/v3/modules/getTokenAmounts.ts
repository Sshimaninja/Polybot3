// import { ethers, utils, BigNumber, Contract } from "ethers";
// import { PoolData } from "./getPoolData";
// import { BigNumber as BN } from "bignumber.js";
// import { wallet } from '../../../constants/contract'
// import { ReservesData, PoolState, PoolInfo, ERC20token, Slot0, Reserves3 } from "../../../constants/interfaces";
// import { abi as IERC20 } from "../../../interfaces/IERC20.json";


// export class Liquidity {
// 	static liquidity: BigNumber[] = [];
// 	poolInfo: PoolInfo;
// 	pool: Contract;
// 	token0: ERC20token;
// 	token1: ERC20token;
// 	token0Contract: Contract;
// 	token1Contract: Contract;
// 	constructor(poolInfo: PoolInfo, pool: Contract, token0: ERC20token, token1: ERC20token) {
// 		this.pool = pool;
// 		this.poolInfo = poolInfo;
// 		this.token0 = token0;
// 		this.token1 = token1;
// 		this.token0Contract = new Contract(token0.id, IERC20, wallet);
// 		this.token1Contract = new Contract(token1.id, IERC20, wallet);
// 	}

// 	async getTokenAmounts() {

// 		// const slot0 = await this.pool.slot0();
// 		// const sqrtPriceX96 = slot0.sqrtPriceX96;
// 		// const Q96 = ethers.BigNumber.from(2).pow(96);
// 		// const sqrtPrice = sqrtPriceX96.mul(Q96).div(Q96);

// 		// let currentTick = slot0.tick;
// 		// let tickspacing = this.poolInfo.tickSpacing;
// 		// let NearestLowTick = (Math.floor(currentTick / tickspacing)) * tickspacing;
// 		// let NearestHighTick = ((Math.floor(currentTick / tickspacing)) * tickspacing) + tickspacing;

// 		// //ref: https://discord.com/channels/597638925346930701/1090098983176773764/1090119292684599316
// 		// let tickLow = (Math.floor(currentTick / tickspacing)) * (tickspacing - (tickspacing * TicksForRange));
// 		// let tickHigh = ((Math.floor(currentTick / tickspacing)) * tickspacing) + (tickspacing + (tickspacing * TicksForRange));

// 		// let sqrtRatioA = Math.sqrt(1.0001 ** tickLow).toFixed(18);
// 		// let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh).toFixed(18);

// 		// let amount0wei = 0;
// 		// let amount1wei = 0;

// 		// if (currentTick < tickLow) {
// 		// 	amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)));
// 		// }
// 		// if (currentTick >= tickHigh) {
// 		// 	amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
// 		// }
// 		// if (currentTick >= tickLow && currentTick < tickHigh) {
// 		// 	amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB)));
// 		// 	amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
// 		// }

// 		// let amount0Human = (amount0wei / (10 ** token0Decimal)).toFixed(token0Decimal);
// 		// let amount1Human = (amount1wei / (10 ** token1Decimal)).toFixed(token1Decimal);

// 		// console.log("Amount Token0 wei: " + amount0wei);
// 		// console.log("Amount Token1 wei: " + amount1wei);
// 		// console.log("Amount Token0 : " + amount0Human);
// 		// console.log("Amount Token1 : " + amount1Human);
// 		// return [amount0wei, amount1wei]
// 	}
// 	async getTokenAmounts2(liquidity, sqrtPriceX96, tickLow, tickHigh, token0Decimal, token1Decimal) {
// 		let sqrtRatioA = Math.sqrt(1.0001 ** tickLow).toFixed(18);
// 		let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh).toFixed(18);
// 		let currentTick = getTickAtSqrtRatio(sqrtPriceX96);
// 		let sqrtPrice = sqrtPriceX96 / Q96;
// 		let amount0wei = 0;
// 		let amount1wei = 0;
// 		if (currentTick < tickLow) {
// 			amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)));
// 		}
// 		if (currentTick >= tickHigh) {
// 			amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
// 		}
// 		if (currentTick >= tickLow && currentTick < tickHigh) {
// 			amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB)));
// 			amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
// 		}

// 		let amount0Human = (amount0wei / (10 ** token0Decimal)).toFixed(token0Decimal);
// 		let amount1Human = (amount1wei / (10 ** token1Decimal)).toFixed(token1Decimal);

// 		console.log("Amount Token0 wei: " + amount0wei);
// 		console.log("Amount Token1 wei: " + amount1wei);
// 		console.log("Amount Token0 : " + amount0Human);
// 		console.log("Amount Token1 : " + amount1Human);
// 		return [amount0wei, amount1wei]
// 	}

// }