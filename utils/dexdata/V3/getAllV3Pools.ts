import { ethers } from 'ethers';
import { abi as IERC20 } from '../../../interfaces/IERC20.json';
import { abi as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { abi as IUniswapV3Factory } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'
import { uniswapV3Factory } from '../../../constants/addresses';
import { wallet } from '../../../constants/contract';
import { Pool, FeeAmount, Tick } from '@uniswap/v3-sdk';
import { TickMath } from '@uniswap/v3-sdk';
import { TickDataProvider } from '@uniswap/v3-sdk';
import { TickProvider } from '../../../scripts/v3/modules/TickProvider';
import { Token } from '@uniswap/sdk-core';
import { parse } from 'path';


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
			const poolAddresses = events.map(async (event) => {
				const parsedEvent = factory.interface.parseLog(event);
				if (parsedEvent.args.token0 != undefined && parsedEvent.args.token1 != undefined) {
					//Verify undefined results are cleaned up
					console.log('parsedEvent', parsedEvent.args.token0, parsedEvent.args.token1, parsedEvent.args.pool);
					const v3Pool = new ethers.Contract(parsedEvent.args.pool, IUniswapV3Pool, wallet);
					const slot0 = await v3Pool.slot0();
					const tick = TickMath.getTickAtSqrtRatio(slot0.sqrtRatioX96);
					const tickProvider = new TickProvider(v3Pool);

					const deployedPool = new Pool(
						await v3Pool.token0(),
						await v3Pool.token1(),
						await v3Pool.fee(),
						slot0.sqrtPriceX96,
						await v3Pool.liquidity(),
						tick,
						tickProvider);
					console.log('deployedPool', deployedPool)
					deployedPools.push(deployedPool); // add the new Pool object to the deployedPools array
					return deployedPool;
				} else {
					return undefined;
				}
			});
			const deployedPools = await Promise.all(poolAddresses);
			console.log('poolAddresses', deployedPools);
		}
	};
}

getAllV3Pools();

