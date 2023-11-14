import { ethers, utils, BigNumber, Contract } from "ethers";

import { BigNumber as BN } from "bignumber.js";
import { wallet } from '../../../constants/contract'
import { ReservesData, PoolState, PoolInfo } from "../../../constants/interfaces";
import { fu, pu } from "../../modules/convertBN";
// import { getPrice } from "./uniswapV3Primer";
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
	poolInfo: PoolInfo;
	pool: Contract;

	constructor(poolInfo: PoolInfo, pool: Contract) {
		this.pool = pool;
		this.poolInfo = poolInfo;
	}

	/*
	reserves0 = inRangeLiquidity * sqrtPriceX96 / 2 ** 96
	reserves1 = inRangeLiquidity * 2 ** 96 / sqrtPriceX96 
	 */

	// async getSqrtRatioAtTick(tick: number): Promise<BN> {
	// 	const sqrtPriceRatio = new BN(1.0001).pow(tick);
	// 	const sqrtPriceX96Fixed = sqrtPriceRatio.multipliedBy(BN(2).pow(96));
	// 	// const sqrtPriceX96JS = sqrtPriceX96Fixed.toFixed();
	// 	return sqrtPriceX96Fixed;
	// }

	async getReservesInRange(): Promise<{ reserves0: BigNumber, reserves1: BigNumber }> {
		const slot0 = await this.pool.slot0()
		// let tickSpacing = this.poolInfo.tickSpacing
		// let tickLower = Math.floor(slot0.tick / tickSpacing) * tickSpacing;
		// let tickUpper = tickLower + tickSpacing;

		// let sqrtPriceX96Lower: BN = await this.getSqrtRatioAtTick(tickLower);
		// let sqrtPriceX96Upper: BN = await this.getSqrtRatioAtTick(tickUpper);



		let liq = await this.pool.liquidity();
		const reserves0 = liq.mul(slot0.sqrtPriceX96).div(BigNumber.from(2).pow(96));
		const reserves1 = liq.mul(BigNumber.from(2).pow(96)).div(slot0.sqrtPriceX96);
		//
		// let reserves0BN = liquidityInRange.multipliedBy(sqrtPriceX96Upper.minus(sqrtPriceX96Lower)).div(BN(2).pow(96));
		// let reserves1BN = liquidityInRange.multipliedBy(BN(2).pow(96)).div(sqrtPriceX96Upper.minus(sqrtPriceX96Lower));

		// const reserves0 = pu(reserves0BN, this.pool.token0.decimals);
		// const reserves1 = pu(reserves1BN, this.pool.token1.decimals)
		return { reserves0, reserves1 };
	}

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


	async getPoolState(): Promise<PoolState> {
		const s0 = this.poolInfo.protocol === 'UNIV3' ? await this.pool.slot0() : await this.pool.globalState();
		const slot0 = this.poolInfo.protocol === 'UNIV3' ? {
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

		const { reserves0, reserves1 } = await this.getReservesInRange();
		const { reserves0BN, reserves1BN } = { reserves0BN: BN(utils.formatUnits(reserves0, this.pool.token0.decimals)), reserves1BN: BN(utils.formatUnits(reserves1, this.pool.token1.decimals)) };

		const priceTokenIn = ((slot0.sqrtPriceX96.div(2).pow(96)).pow(2)).div(BigNumber.from(10).pow(this.pool.token1.decimals).div(10).pow(this.pool.token0.decimals))//.toFixed(Decimal1);
		const priceTokenInHR = fu(priceTokenIn, this.pool.token0.decimals);
		const priceTokenOut = (BigNumber.from(1).div(priceTokenIn))//.toFixed(Decimal0);
		const priceTokenOutHR = fu(priceTokenOut, this.pool.token1.decimals);

		// const priceInBN = (())


		const liquidityData: PoolState = {
			poolID: this.pool.address,
			sqrtPriceX96: slot0.sqrtPriceX96,
			liquidity: liquidity,
			reserveIn: reserves0,
			reserveOut: reserves1,
			reserveInBN: reserves0BN,
			reserveOutBN: reserves1BN,
			priceInJS: priceTokenInHR,
			priceOutJS: priceTokenOutHR,
			// priceInBN: price0BN,
			// priceOutBN: price1BN
		};
		const liquiditDataView = {
			poolID: this.pool.address,
			liquidity: liquidity.toString(),
			reserves0: fu(reserves0, this.pool.token0.decimals),
			reserves1: fu(reserves1, this.pool.token1.decimals),
			reserves0BN: reserves0BN.toFixed(this.pool.token0.decimals),
			reserves1BN: reserves1BN.toFixed(this.pool.token1.decimals),
			priceIn: fu(liquidityData.priceInJS, this.pool.token0.decimals),
			priceOut: fu(liquidityData.priceOutJS, this.pool.token1.decimals),
			// priceInBN: price0BN.toFixed(this.pool.token0.decimals),
			// priceOutBN: price1BN.toFixed(this.pool.token1.decimals)
		}
		console.log(liquiditDataView)
		console.log("Poolstate ", this.pool.address, " Complete")
		return liquidityData;
	}


	// Get the two token prices of the pool
	// PoolInfo is a dictionary object containing the 4 variables needed
	// {"SqrtX96" : slot0.sqrtPriceX96.toString(), "Pair": pairName, "Decimal0": Decimal0, "Decimal1": Decimal1}
	// to get slot0 call factory contract with tokens and fee, 
	// then call the pool slot0, sqrtPriceX96 is returned as first dictionary variable
	// var FactoryContract =  new ethers.Contract(factory, IUniswapV3FactoryABI, provider);
	// var V3pool = await FactoryContract.getPool(token0, token1, fee);
	// var poolContract =  new ethers.Contract(V3pool, IUniswapV3PoolABI, provider);
	// var slot0 = await poolContract.slot0();
	/*
	function GetPrice(PoolInfo) {
		let sqrtPriceX96 = PoolInfo.SqrtX96;
		let Decimal0 = PoolInfo.Decimal0;
		let Decimal1 = PoolInfo.Decimal1;
	
		const buyOneOfToken0 = ((sqrtPriceX96 / 2 ** 96) ** 2) / (10 ** Decimal1 / 10 ** Decimal0).toFixed(Decimal1);
	
		const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(Decimal0);
		console.log("price of token0 in value of token1 : " + buyOneOfToken0.toString());
		console.log("price of token1 in value of token0 : " + buyOneOfToken1.toString());
		console.log("");
		// Convert to wei
		const buyOneOfToken0Wei = (Math.floor(buyOneOfToken0 * (10 ** Decimal1))).toLocaleString('fullwide', { useGrouping: false });
		const buyOneOfToken1Wei = (Math.floor(buyOneOfToken1 * (10 ** Decimal0))).toLocaleString('fullwide', { useGrouping: false });
		console.log("price of token0 in value of token1 in lowest decimal : " + buyOneOfToken0Wei);
		console.log("price of token1 in value of token1 in lowest decimal : " + buyOneOfToken1Wei);
		console.log("");
	}
		
		// // Using slot0 data:
		// const reserves0 = slot0.tick > 0 ? slot0.sqrtPriceX96.mul(slot0.sqrtPriceX96).div(BigNumber.from(2).pow(192)) :
		// 	slot0.sqrtPriceX96.mul(BigNumber.from(2).pow(96)).div(BigNumber.from(2).pow(192));
		// const reserves1 = slot0.tick < 0 ? slot0.sqrtPriceX96.mul(slot0.sqrtPriceX96).div(BigNumber.from(2).pow(192)) :
		// 	slot0.sqrtPriceX96.mul(BigNumber.from(2).pow(96)).div(BigNumber.from(2).pow(192));

		// // Using observe([0]):
		// // const { reserves0, reserves1 } = await this.getCurrentReserves();

		// const { reserves0String, reserves1String } = { reserves0String: fu(reserves0, this.pool.token0.decimals), reserves1String: fu(reserves1, this.pool.token1.decimals) };

		// let reserves0BN = BN(reserves0String);
		// let reserves1BN = BN(reserves1String);

		// let price0BN = reserves1BN.multipliedBy((2).toExponential(96)).div(reserves0BN.sqrt());
		// let price1BN = reserves0BN.multipliedBy((2).toExponential(96)).div(reserves1BN.sqrt());

		// const price = getPrice(s0, this.poolInfo);

	// WETH / USDC pool 0.05%    →(1% == 10000, 0.3% == 3000, 0.05% == 500, 0.01 == 100)
	("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 500)
	// Output
	price of token0 in value of token1: 1539.296453
	price of token1 in value of token0: 0.000649647439939888
	price of token0 in value of token1 in lowest decimal: 1539296453
	price of token1 in value of token1 in lowest decimal: 649647439939888
	*/

};

