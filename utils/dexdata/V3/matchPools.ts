import fs from 'fs';
import path from 'path';
import { Match3Pools, Valid3Pool as Pool, PoolsV3, V3Matches } from '../../../constants/interfaces';
import { uniswapV3Factory, algebraFactory } from '../../../constants/addresses';
import { abi as IERC20 } from '../../../interfaces/IERC20.json';
import { abi as IAlgebraPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json';
import { abi as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { provider } from '../../../constants/contract';
import { Contract } from 'ethers';
/**
 */


export async function matchPools() {
	const dataDir3 = '/mnt/d/code/arbitrage/polybot-live/polybotv3/data/validPairs/v3/';
	const dataDirAlg = `/mnt/d/code/arbitrage/polybot-live/polybotv3/data/validPairs/algebra/`
	const matchesDir = `/mnt/d/code/arbitrage/polybot-live/polybotv3/data/matches/v3/`;

	const filesA = fs.readdirSync(dataDir3);
	const filesB = fs.readdirSync(dataDirAlg);


	// Loop through all the files in the validPools/v3 directory
	for (let i = 0; i < filesA.length; i++) {
		const fileA = filesA[i];
		const fileAName = fileA.split('.')[0];
		const dataA = require(path.join(dataDir3, fileA));

		// Loop through all the files in the validPools/algebra directory
		for (let j = 0; j < filesB.length; j++) {
			const fileB = filesB[j];
			const fileBName = fileB.split('.')[0];
			const dataB = require(path.join(dataDirAlg, fileB));

			if (dataA && dataB) {
				console.log("loop1", fileAName, fileBName)
				const matchingPools: Match3Pools[] = [];



				for (const poolA of dataA) {
					for (const poolB of dataB) {
						if (poolA.token1 !== poolB.token1 && poolA.token0 !== poolB.token0) {
							console.log("No Match: ", poolA.poolID, poolB.poolID)
							console.log('Tokens: ' + poolA.token0 + ' ' + poolA.token1 + ' ' + poolB.token0 + ' ' + poolB.token1)
						}
						if (
							(poolA.token0 === poolB.token0) &&
							(poolA.token1 === poolB.token1)
							// &&
							// poolA.token1 === poolB.token1) ||
							// (poolA.token0 === poolB.token1 &&
							// 	poolA.token1 === poolB.token0)
						) {
							console.log("loop3", poolA.poolID, poolB.poolID)
							let PoolA = new Contract(poolA.poolID, IUniswapV3Pool, provider);
							console.log('poolA initialized', PoolA.address)
							let PoolB = new Contract(poolB.poolID, IAlgebraPool, provider);
							console.log('poolB initialized', PoolB.address)
							let token0 = new Contract(poolA.token0, IERC20, provider);
							console.log('token0 initialized', token0.address)
							let token1 = new Contract(poolA.token1, IERC20, provider);
							console.log('token1 initialized', token1.address)
							let poolMatch: Match3Pools = {
								ticker: (await token0.symbol()) + '/' + (await token1.symbol()),
								poolID0: {
									id: poolA.poolID,
									tickSpacing: poolA.tickSpacing,
									fee: poolA.fee
								},
								poolID1: {
									id: poolB.poolID,
									tickSpacing: poolB.tickSpacing,
									fee: poolB.fee
								},
								token0: {
									// contract: token0.deployed(),
									id: poolA.token0,
									symbol: await token0.symbol(),
									decimals: await token0.decimals()
								},
								token1: {
									// contract: token1.deployed(),
									id: poolA.token1,
									symbol: await token1.symbol(),
									decimals: await token1.decimals()
								}
							}
							await Promise.all([PoolA, PoolB, token0, token1])
							matchingPools.push(poolMatch);
							// console.log(poolMatch)
						}
						// console.log(matchingPools)
					}
				}
				console.log('matchingPools', matchingPools.length)
				const allMatches: V3Matches = {
					exchangeA: `${fileAName}`,
					exchangeB: `${fileBName}`,
					matches: matchingPools
				};
				fs.writeFile(path.join(matchesDir, `${fileAName}${fileBName}.json`), JSON.stringify(allMatches, null, 2), function (err) {
					if (err) return console.log(err);
					console.log(`Matching pairs written to ${path.join(matchesDir, `${fileAName}${fileBName}.json`)}`);
				});
			};
		}
	}
}



matchPools();