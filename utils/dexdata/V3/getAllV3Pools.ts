import { ethers } from 'ethers';
import { abi as IERC20 } from '../../../interfaces/IERC20.json';
import { abi as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { abi as IUniswapV3Factory } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'
import { uniswapV3Factory } from '../../../constants/addresses';
import { wallet } from '../../../constants/contract';
import fs from 'fs';
import path from 'path';
import { Pool } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { fitFee } from './fitFee';

export async function getAllV3Pools() {

	// Get the addresses of all the deployed UNISWAP V3 factories
	const uniswapV3Factories = Object.values(uniswapV3Factory);
	let deployedPools: Pool[] = [];

	for (const exchange of uniswapV3Factories) {
		const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.infura.io/v3/ae479bfaa1b54326a4770a0fe8aa801d")
		const blockNumber = await provider.getBlockNumber();
		const factory = new ethers.Contract(exchange, IUniswapV3Factory, provider);
		console.log('check contract init factory.address', factory.address, 'blockNumber', blockNumber)

		const batchSize = 10000;
		const startBlock = 0x15B40AB; // 229773835 in decimal
		const endBlock = 0x29F1B93; // 441965587 in decimal
		const numBatches = Math.ceil((endBlock - startBlock) / batchSize);

		for (let i = 0; i < numBatches; i++) {
			const fromBlock = startBlock + i * batchSize;
			const toBlock = Math.min(fromBlock + batchSize - 1, endBlock);
			const filter = {
				address: factory.address,
				fromBlock: fromBlock,
				toBlock: toBlock,
			};
			const events = await provider.getLogs(filter);
			events.map(async (event) => {
				const parsedEvent = factory.interface.parseLog(event);
				if (parsedEvent.args.token0 != undefined && parsedEvent.args.token1 != undefined) {
					const t0 = new ethers.Contract(parsedEvent.args.token0, IERC20, provider);
					const t1 = new ethers.Contract(parsedEvent.args.token1, IERC20, provider);
					const v3Pool = new ethers.Contract(parsedEvent.args.pool, IUniswapV3Pool, wallet);
					const liquidity = await v3Pool.liquidity();
					if (liquidity.gt(10000)) {
						const token0 = new Token(137, await parsedEvent.args.token0, await t0.decimals(), await t0.symbol());
						const token1 = new Token(137, await parsedEvent.args.token1, await t1.decimals(), await t1.symbol());
						const fee = await v3Pool.fee();
						const feeAmount = await fitFee(fee);
						const slot0 = await v3Pool.slot0();
						const tickSpacing = await v3Pool.tickSpacing();
						const deployedPool = new Pool(
							token0,
							token1,
							feeAmount,
							slot0.sqrtPriceX96,
							liquidity,
							await slot0.tick,
						);
						deployedPools.push(deployedPool); // add the new Pool object to the deployedPools array
					}
				}
				// console.log('poolAddresses', deployedPools);
				return deployedPools;
			});
		}
		const fileName = `${exchange}.json`;
		const filePath = path.join(__dirname, `../../../data/v3/validPairs/${fileName}`);
		fs.writeFileSync(filePath, JSON.stringify(deployedPools));
		deployedPools = []; // reset the deployedPools array for the next exchange

	}
}
getAllV3Pools();


// // Possibly useful later, but apparently not useful just now.
// const tick = TickMath.getTickAtSqrtRatio(slot0.sqrtRatioX96);
// const tickProvider = new TickProvider(v3Pool);


// const fee = FeeAmount.MEDIUM;
// const sqrtRatioX96 = parsedEvent.args.sqrtPriceX96;
// const liquidity = parsedEvent.args.liquidity;
// const tickCurrent = parsedEvent.args.tick;
// const ticks: Tick[] = [];
// const deployedPool = new Pool(token0, token1, fee, sqrtRatioX96, liquidity, tickCurrent, ticks);
// deployedPools.push(deployedPool); // add the new Pool object to the deployedPools array
// return deployedPool;