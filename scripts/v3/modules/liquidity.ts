// import { ethers, utils, BigInt, Contract } from "ethers";
// import { abi as IERC20 } from "../../../interfaces/IERC20.json
// import { BigNumber as BN } from "bignumber.js";
// import { wallet } from '../../../constants/contract'
// import { ReservesData, PoolState, PoolInfo, ERC20token, Slot0 } from "../../../constants/interfaces";
// import { sqrt } from "./tradeMath";
// import { BN2JS, fu, pu } from "../../modules/convertBN";
// // import { getPrice } from "./uniswapV3Primer";
// /**
//  * @description
//  * For V3 this returns liquidity in range as well as pool 'state'.
//  *
//  */

// export class InRangeLiquidity {
// 	static liquidity: bigint[] = [];
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

// 	async getSlot0(): Promise<Slot0> {
// 		let s0: Slot0 = {
// 			sqrtPriceX96: 0n,
// 			sqrtPriceX96BN: BN(0),
// 			tick: 0,
// 			fee: 0,
// 			unlocked: false,
// 		};
// 		try {
// 			if (this.poolInfo.protocol === 'UNIV3') {
// 				const slot0 = await this.pool.slot0();
// 				s0 = {
// 					sqrtPriceX96: slot0.sqrtPriceX96,
// 					sqrtPriceX96BN: BN(slot0.sqrtPriceX96.toString()),
// 					tick: slot0.tick,
// 					fee: this.pool.fee(),
// 					unlocked: slot0.unlocked,
// 				}
// 				// console.log("Slot0: UNIV3", slot0)
// 				return s0;
// 			} else if (this.poolInfo.protocol === 'ALG') {
// 				const slot0 = await this.pool.globalState();
// 				s0 = {
// 					sqrtPriceX96: slot0.price,
// 					sqrtPriceX96BN: BN(slot0.price.toString()),
// 					tick: slot0.tick,
// 					fee: slot0.fee,
// 					unlocked: slot0.unlocked,
// 				}
// 				// console.log("Slot0: ALG", s0)
// 				return s0;
// 			}
// 		} catch (error: any) {
// 			console.log("Error in " + this.poolInfo.protocol + " getPoolState: " + error.message)
// 			return s0;
// 		}
// 		return s0;
// 	};

// 	async getPriceBN(sqrtPriceX96: BN, decimal0: number, decimal1: number): Promise<{ priceInBN: BN, priceOutBN: BN, priceIn: string, priceOut: string }> {

// 		// Calculate the price as (sqrtPriceX96 / 2^96)^2
// 		const price: BN = sqrtPriceX96.dividedBy(new BN(2).pow(96)).pow(2);

// 		// Adjust for token decimals
// 		const priceIn: BN = price.times(new BN(10).pow(decimal0)).dividedBy(new BN(10).pow(decimal1));
// 		const priceOut: BN = new BN(1).div(priceIn);

// 		// Convert to string with appropriate number of decimals
// 		const priceInString: string = priceIn.toFixed(decimal0);
// 		const priceOutString: string = priceOut.toFixed(decimal1);
// 		// const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(decimal0);

// 		const prices = {
// 			priceInBN: priceIn,
// 			priceOutBN: priceOut,
// 			priceIn: priceInString,
// 			priceOut: priceOutString
// 		}
// 		return prices
// 	}
// 	//ref: https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
// 	//ref: https://github.com/atiselsts/uniswap-v3-liquidity-math/blob/master/subgraph-liquidity-query-example.py
// 	async calculateLiquidityAmounts(): Promise<{ rBN0: BN, rBN1: BN }> {
// 		let slot0 = await this.getSlot0();
// 		let sqrtPX96 = slot0.sqrtPriceX96BN;
// 		let liq = await this.pool.liquidity();
// 		let L = BN(liq.toString())
// 		let prices = await this.getPriceBN(sqrtPX96, this.token0.decimals, this.token1.decimals)
// 		let P = prices.priceInBN

// 		// let P: BN = sqrtPX96.dividedBy(BN(2).pow(96)).pow(2);

// 		let tickBottom = Math.floor(slot0.tick / (this.poolInfo.tickSpacing)) * this.poolInfo.tickSpacing
// 		let tickTop = tickBottom + this.poolInfo.tickSpacing

// 		// Calculate square root prices
// 		const sqrtPA = BN(10).pow(18).times(Math.pow(1.0001, tickBottom));
// 		const sqrtPB = BN(10).pow(18).times(Math.pow(1.0001, tickTop));

// 		// Calculate x and y
// 		const x = L.times(sqrtPB.minus(P.sqrt())).div(P.sqrt());
// 		const y = L.times(P.sqrt().minus(sqrtPA));

// 		// Adjust x and y for token decimals
// 		const rBN0 = x.div(BN(10).pow(this.token0.decimals));
// 		const rBN1 = y.div(BN(10).pow(this.token1.decimals));

// 		return { rBN0, rBN1 };
// 	}

// 	async getSqrtRatioAtTick(tick: number): Promise<{ sqrtRatioX96: BN }> {
// 		const MIN_TICK = -887272;
// 		const MAX_TICK = -MIN_TICK;
// 		const Q32 = 2 ** 32;

// 		if (tick < MIN_TICK || tick > MAX_TICK) {
// 			throw new Error('Tick out of range');
// 		}

// 		const absTick = tick < 0 ? -tick : tick;
// 		let ratio = ((absTick & 0x1) != 0) ?
// 			BN('0xfffcb933bd6fad37aa6d09348e1c3f3e06839bdd9a9a21404400000000000000', 16) :
// 			BN('0x10000000000000000000000000000000000000000000000000000000000000000', 16);

// 		for (let i = 0; i < 14; i++) {
// 			if ((absTick & (0x2 ** i)) != 0) {
// 				const ratioFactor = BN('0xfffcb933bd6fad37aa6d09348e1c3f3e06839bdd9a9a21404400000000000000', 16).shiftedBy(-i * 2);
// 				ratio = ratio.times(ratioFactor).shiftedBy(-128);
// 			}
// 		}

// 		if (tick < 0) ratio = BN(Q32).pow(2).times(Q32).dividedBy(ratio);

// 		return { sqrtRatioX96: ratio };
// 	}

// 	//ref: https://github.com/atiselsts/uniswap-v3-liquidity-math/blob/master/uniswap-v3-liquidity-math.py
// 	async getReserve0(liq: BN, sp: BN, sa: BN, sb: BN,) {
// 		sp = BN.max(BN.min(sp, sb), sa);
// 		return liq.times(sb.minus(sp)).div(sp.times(sb));
// 	};

// 	async getReserve1(liq: BN, sp: BN, sa: BN, sb: BN,) {
// 		sp = BN.max(BN.min(sp, sb), sa);
// 		return liq.times(sp.minus(sa))//.div(sp);
// 	};



// 	async getReservesInRange(): Promise<{ r0BN: BN, r1BN: BN }> {
// 		const slot0 = await this.pool.slot0();
// 		const tickSpacing = this.poolInfo.tickSpacing;
// 		const tick = slot0.tick;
// 		const tickLower = Math.floor(tick / tickSpacing) * tickSpacing;
// 		const tickUpper = tickLower + tickSpacing;

// 		let sqrtRatioX96 = slot0.sqrtPriceX96BN;
// 		let sqrtRatioAX96 = await this.getSqrtRatioAtTick(tickLower * tickSpacing);
// 		let sqrtRatioBX96 = await this.getSqrtRatioAtTick(tickUpper * tickSpacing);

// 		let liq = await this.pool.liquidity();
// 		liq = BN(liq.toString())

// 		let r0BN = await this.getReserve0(liq, sqrtRatioX96, sqrtRatioAX96.sqrtRatioX96, sqrtRatioBX96.sqrtRatioX96);
// 		let r1BN = await this.getReserve1(liq, sqrtRatioX96, sqrtRatioAX96.sqrtRatioX96, sqrtRatioBX96.sqrtRatioX96);
// 		// Convert sqrtPriceX96 to price
// 		// const price = slot0.sqrtPriceX96BN.div(BN(2).pow(96));

// 		// Calculate reserves
// 		// let r0BN = liq.div(slot0.sqrtPriceX96BN);
// 		// let r1BN = liq.times(slot0.sqrtPriceX96BN);
// 		// let r0BN = liq.div(slot0.sqrtPriceX96BN)
// 		// // console.log("Reserves0: ", r0BN.toFixed(this.token0.decimals))
// 		// let r1BN = liq.times(slot0.sqrtPriceX96BN)
// 		// console.log("Reserves1: ", r1BN.toFixed(this.token1.decimals))

// 		// const reserves0 = liq.mul(slot0.sqrtPriceX96).div(BigInt.from(2).pow(96));
// 		// const reserves1 = liq.mul(BigInt.from(2).pow(96)).div(slot0.sqrtPriceX96);

// 		return { r0BN, r1BN };
// 	}




// 	async getInRangeReserves(): Promise<Reserves3> {
// 		// Get the in-range liquidity
// 		const liquidity = await this.pool.liquidity();

// 		const liq = BN(liquidity.toString());

// 		// Get the current price
// 		// const prices = await this.getPriceBN();
// 		const s0 = await this.getSlot0();
// 		const sqrtPrice = s0.sqrtPriceX96BN.div(BN(2).pow(96));
// 		const price = sqrtPrice.pow(2);
// 		console.log("price: ", price.toFixed(18))
// 		// console.log('prices: ', prices)

// 		const balance0 = await this.token0Contract.balanceOf(this.poolInfo.id);
// 		const balance1 = await this.token1Contract.balanceOf(this.poolInfo.id);

// 		// Calculate the reserves
// 		const reserves0BN = liq.div(sqrtPrice);
// 		// console.log('reserves0BN: ', reserves0BN.toFixed(this.token0.decimals))
// 		const reserves1BN = liq.times(sqrtPrice);
// 		// console.log('reserves1BN: ', reserves1BN.toFixed(this.token1.decimals))

// 		const reserves0 = pu(reserves0BN.toFixed(this.token0.decimals), this.token0.decimals);
// 		const reserves1 = pu(reserves1BN.toFixed(this.token1.decimals), this.token1.decimals);

// 		const reserves0String = reserves0BN.toFixed(this.token0.decimals);
// 		const reserves1String = reserves1BN.toFixed(this.token1.decimals);

// 		const reserves: Reserves3 = {
// 			balance0: balance0,
// 			balance1: balance1,
// 			reserves0: reserves0,
// 			reserves1: reserves1,
// 			reserves0BN: reserves0BN,
// 			reserves1BN: reserves1BN,
// 			reserves0String: reserves0String,
// 			reserves1String: reserves1String
// 		};
// 		return reserves;
// 	}


// 	async getReservesInRange1(): Promise<{ reserves0: bigint, reserves1: bigint, reserves0BN: BN, reserves1BN: BN }> {
// 		const slot0 = await this.getSlot0();

// 		let liq = await this.pool.liquidity();
// 		liq = BN(liq.toString())

// 		let reserves0BN: BN = liq.div(slot0.sqrtPriceX96BN);
// 		let reserves1BN: BN = liq.multipliedBy(slot0.sqrtPriceX96BN);

// 		const reserves0: bigint = pu((reserves0BN.toFixed(this.token0.decimals)), this.token0.decimals);
// 		const reserves1: bigint = pu((reserves1BN.toFixed(this.token1.decimals)), this.token1.decimals);

// 		return { reserves0, reserves1, reserves0BN, reserves1BN };
// 	}


// 	async getReservesInRange2(tickLower: number, tickUpper: number): Promise<BigInt> {
// 		let totalLiquidity = 0n;

// 		for (let tick = tickLower; tick <= tickUpper; tick++) {
// 			const tickData = await this.pool.ticks(tick);
// 			totalLiquidity = totalLiquidity.add(tickData.liquidityNet);
// 		}

// 		return totalLiquidity;
// 	}

// 	// Using 'cumulative' data from slot0, calculate all reserves across all ticks
// 	async getTotalReserves(): Promise<{ reserves0: bigint, reserves1: bigint }> {

// 		// Get the current state of the pool
// 		const [secondsAgo, tickCumulatives, liquidityCumulatives] = await this.pool.observe([0]);
// 		console.log("Seconds Ago: ", secondsAgo[0].toString())
// 		console.log("Tick Cumulatives: ", tickCumulatives[0].toString())
// 		console.log("Liquidity Cumulatives: ", liquidityCumulatives[0].toString())

// 		// The current tick cumulative and liquidity cumulative are the first elements of the returned arrays
// 		const currentTickCumulative = tickCumulatives[0];
// 		const currentLiquidityCumulative = liquidityCumulatives[0];

// 		// The current tick and liquidity can be calculated from the cumulatives
// 		const currentTick = currentTickCumulative.div(ethers.BigInt.from(secondsAgo[0]));
// 		const currentLiquidity = currentLiquidityCumulative.div(ethers.BigInt.from(secondsAgo[0]));

// 		// The reserves can be calculated from the current tick and liquidity
// 		const reserves0 = currentLiquidity.mul(BigInt.from(1).sub(currentTick));
// 		const reserves1 = currentLiquidity.mul(currentTick);

// 		return { reserves0, reserves1 };
// 	}

// 	// async getReservesUsingTickMath(): Promise<{ reserves0: bigint, reserves1: bigint }> {
// 	// 	const poolData = new PoolData(this.poolInfo, this.pool, this.token0, this.token1, chainID.POLYGON);
// 	// 	const p = await poolData.getPoolState();
// 	// 	const s = await this.pool.slot0();

// 	// 	const lowerTick = TickMath.getTickAtSqrtRatio(s.sqrtPriceX96.sub(this.poolInfo.tickSpacing));
// 	// 	const upperTick = TickMath.getTickAtSqrtRatio(s.sqrtPriceX96.add(this.poolInfo.tickSpacing));

// 	// 	const r = await this.getReservesInRange2(lowerTick, upperTick);

// 	// 	return { reserves0: r.reserves0, reserves1: r.reserves1 };
// 	// }

// 	// async getInRange(): Promise<{ reserves0: bigint, reserves1: bigint }> {
// 	// 	const liquidity = await this.pool.liquidity();
// 	// 	const slot0 = await this.getSlot0();
// 	// 	const price = await this.getPriceBN(slot0.sqrtPriceX96BN, this.token0.decimals, this.token1.decimals);

// 	// 	// Create a position
// 	// 	const position = new Position({
// 	// 		pool: this.pool,
// 	// 		liquidity: liquidity.toString(),
// 	// 		tickLower: TickMath.MIN_TICK,
// 	// 		tickUpper: TickMath.MAX_TICK
// 	// 	});

// 	// 	// Get the in-range reserves
// 	// 	const reserves0 = position.amount0.toFixed();
// 	// 	const reserves1 = position.amount1.toFixed();

// 	// 	return { reserves0, reserves1 };
// 	// }


// 	// const slot0 = await this.getSlot0();
// 	// const tickSpacing = this.poolInfo.tickSpacing;
// 	// const tick = slot0.tick;
// 	// const tickLower = Math.floor(tick / tickSpacing) * tickSpacing;
// 	// const tickUpper = tickLower + tickSpacing;
// 	// return { tickLower, tickUpper }

// 	async getPoolState(): Promise<PoolState> {

// 		let s0 = await this.getSlot0();
// 		const slot0: Slot0 = {
// 			sqrtPriceX96: s0.sqrtPriceX96,
// 			sqrtPriceX96BN: s0.sqrtPriceX96BN,
// 			tick: s0.tick,
// 			fee: s0.fee,
// 			unlocked: s0.unlocked
// 		};

// 		const pBN = await this.getPriceBN(slot0.sqrtPriceX96BN, this.token0.decimals, this.token1.decimals)
// 		const prices = {
// 			// JS: pJS,
// 			BN: pBN,
// 		}
// 		const liquidity = await this.pool.liquidity();

// 		// let r = await this.getReservesInRange();
// 		let r = await this.calculateLiquidityAmounts();

// 		let reserves0 = pu(r.rBN0.toFixed(this.token0.decimals), this.token0.decimals);
// 		let reserves1 = pu(r.rBN1.toFixed(this.token1.decimals), this.token1.decimals);


// 		const liquidityData: PoolState = {
// 			poolID: this.pool.address,
// 			sqrtPriceX96: slot0.sqrtPriceX96,
// 			liquidity: liquidity,
// 			liquidityBN: BN(liquidity.toString()),
// 			reserveIn: reserves0,
// 			reserveOut: reserves1,
// 			reserveInBN: r.rBN0,
// 			reserveOutBN: r.rBN1,
// 			priceIn: prices.BN.priceIn,
// 			priceOut: prices.BN.priceOut,
// 			priceInBN: prices.BN.priceInBN,
// 			priceOutBN: prices.BN.priceOutBN
// 		};
// 		const liquidityDataView = {
// 			ticker: this.token0.symbol + "/" + this.token1.symbol,
// 			poolID: this.pool.address,
// 			liquidity: liquidity.toString(),
// 			reserves0: fu(reserves0, this.token0.decimals),
// 			reserves1: fu(reserves1, this.token1.decimals),
// 			reserves0BN: r.rBN0.toFixed(this.token0.decimals),
// 			reserves1BN: r.rBN1.toFixed(this.token1.decimals),
// 			priceIn: prices.BN.priceIn,
// 			priceOut: prices.BN.priceOut,
// 			// priceInBN: prices.BN.priceInBN,
// 			// priceOutBN: prices.BN.priceOutBN,
// 		}
// 		console.log('liquiditydataview: ')
// 		console.log(liquidityDataView)
// 		// console.log("Poolstate ", this.pool.address, " : ", this.poolInfo.protocol, " Complete")
// 		return liquidityData;
// 	}


// };

// // Get the in-range liquidity
// // const liquidity = await this.pool.liquidity();
// // const liq = BN(liquidity.toString());
// // if (liq.isZero()) {
// // 	console.log('liq is zero for ', this.token0.symbol, '/', this.token1.symbol, ' on ', this.poolInfo.exchange, '. Skipping...')
// // 	return {
// // 		reserves0: 0n,
// // 		reserves1: 0n,
// // 		reserves0BN: BN(0),
// // 		reserves1BN: BN(0),
// // 		reserves0String: '0',
// // 		reserves1String: '0'
// // 	};
// // } else {

// // 	// Get the current price
// // 	const prices = await this.getPriceBN();
// // 	// console.log('prices: ', prices)

// // 	// Calculate the reserves
// // 	const reserves0BN = liq.div(prices.priceInBN);
// // 	// console.log('reserves0BN: ', reserves0BN.toFixed(this.token0.decimals))
// // 	const reserves1BN = liq.times(prices.priceInBN);
// // 	// console.log('reserves1BN: ', reserves1BN.toFixed(this.token1.decimals))

// // 	const reserves0 = pu(reserves0BN.toFixed(this.token0.decimals), this.token0.decimals);
// // 	const reserves1 = pu(reserves1BN.toFixed(this.token1.decimals), this.token1.decimals);

// // 	const reserves0String = reserves0BN.toFixed(this.token0.decimals);
// // 	const reserves1String = reserves1BN.toFixed(this.token1.decimals);

// // 	const reserves: Reserves3 = {
// // 		reserves0: reserves0,
// // 		reserves1: reserves1,
// // 		reserves0BN: reserves0BN,
// // 		reserves1BN: reserves1BN,
// // 		reserves0String: reserves0String,
// // 		reserves1String: reserves1String
// // 	};
// // 	return reserves;
// // }
