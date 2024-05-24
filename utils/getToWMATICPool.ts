import { Contract } from "ethers";
import { ToWMATICPool } from "../constants/interfaces";
import { abi as IUniswapV3Pool } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { abi as IAlgebraPool } from "@cryptoalgebra/core/artifacts/contracts/interfaces/IAlgebraPool.sol/IAlgebraPool.json";
import { abi as IUniswapV3Factory } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json";

import { BigNumber as BN } from "bignumber.js";
import { uniswapV3Exchange, gasTokens } from "../constants/addresses";
import { signer, wallet } from "../constants/provider";

import { fu } from "../scripts/modules/convertBN";
import { zero, wmatic } from "../constants/environment";
import { uniswap } from "../typechain-types";

// interface ToWMATICPool {
//     ticker: string;
//     tokenIn: { id: string; decimals: number; symbol: string };
//     tokenOut: { id: string; decimals: number; symbol: string };
//     id: string;
//     exchange: string;
//     liq: {
//         liq0: bigint;
//         liq1: bigint;
//     };
//     liquidity: bigint;
// }
export async function getGas2WMATICArray(): Promise<ToWMATICPool[]> {
	async function getGasTokenToWMATICPool(): Promise<ToWMATICPool[]> {
		const wmaticID = await wmatic.getAddress();
		const ToWMATICPools: ToWMATICPool[] = [];
		for (let exchange in uniswapV3Exchange) {
			//let exchangeID = uniswapV3Exchange[exchange].factory;
			for (let token in gasTokens) {
				if (gasTokens[token] !== wmaticID) {
					let tokenID = gasTokens[token];
					let IPool = IUniswapV3Pool;
					if (uniswapV3Exchange[exchange].protocol === "UNIV3") {
						const factory = uniswapV3Exchange[exchange].factory;
						const fees = [500, 3000, 10000]
						let poolAddress = zero;
						for (const fee of fees) {
							poolAddress = await factory.getpool(wmaticID, tokenID, fee);
							if (poolAddress !== zero) {
								continue;
							}
						}
						if (poolAddress === zero) {
							console.log("No pool found for ", token, " and ", wmaticID);
						}

						if (uniswapV3Exchange[exchange].protocol === "ALG") {
							const factory = uniswapV3Exchange[exchange].factory;
							poolAddress = await factory.getpool(wmaticID, tokenID);
							if (poolAddress === zero) {
								console.log("No pool found for ", token, " and ", wmaticID);
							}

						}
						const poolContract = new Contract(poolAddress, IPool, signer);
						const r: bigint = await poolContract.liquidity();
						//const r0: bigint = r[0];
						//const r1: bigint = r[1];
						const token0 = {
							id: await poolContract.token0(),
							decimals: Number(await poolContract.decimals()),
							liq: r,
						};
						const token1 = {
							id: await poolContract.token1(),
							decimals: Number(await poolContract.decimals()),
							liq: r,
						};
						const tokenIn = token0.id == wmaticID ? token1 : token0;
						const tokenOut = token0.id == wmaticID ? token0 : token1;



						const ToWMATICPool: ToWMATICPool = {
							ticker: token + "WMATIC",
							id: poolAddress,
							exchange: exchange,
							tokenIn: { id: tokenIn.id, decimals: tokenIn.decimals, symbol: token },
							tokenOut: {
								id: tokenOut.id,
								decimals: tokenOut.decimals,
								symbol: "WMATIC",
							},
							liq: r,

						};
						ToWMATICPools.push(ToWMATICPool);
					}
				}
			}
			// console.log("ToWMATICPools: ", ToWMATICPools);
			return ToWMATICPools;
		}
		console.log("Something wrong with the ToWMATICPools: ", ToWMATICPools);
		return ToWMATICPools;
	}

	async function compareLiquidity(ToWMATICPools: ToWMATICPool[]): Promise<ToWMATICPool[]> {
		const highestLiquidityPools: { [key: string]: ToWMATICPool } = {};

		for (let ToWMATICPool of ToWMATICPools) {
			// Create a unique key for the pool of tokens
			const key = ToWMATICPool.tokenIn.id;

			// If the key doesn't exist in the object, or if the current ToWMATICPool has higher liquidity,
			// add/replace the ToWMATICPool in the object
			if (
				!highestLiquidityPools[key] ||
				ToWMATICPool.liq > highestLiquidityPools[key].liq
			) {
				highestLiquidityPools[key] = ToWMATICPool;
			}
		}

		// Convert the object values to an array and return it
		// console.log("highestLiquidityPools: ", highestLiquidityPools);
		return Object.values(highestLiquidityPools);
	}
	const ToWMATICPools = await getGasTokenToWMATICPool();
	const highestLiquidityPools = await compareLiquidity(ToWMATICPools);
	// fs.writeFile(
	//     "./constants/ToWMATICPools.json",
	//     JSON.stringify(highestLiquidityPools, (key, value) => {
	//         if (typeof value === "bigint") {
	//             return value.toString();
	//         }
	//         return value;
	//     }),
	//     (err) => {
	//         if (err) {
	//             console.error(err);
	//             return;
	//         }
	//         console.log("File has been created");
	//     },
	// );
	return highestLiquidityPools;
}
//getGas2WMATICArray();

/*

*/
