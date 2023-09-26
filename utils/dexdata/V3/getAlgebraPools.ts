import { ethers, utils, Contract } from 'ethers';
import { abi as AlgebraFactory} from '../../../interfaces/IAlgebraFactory.json'
import { FactoryMap, uniswapV3Factory } from '../../../constants/addresses';
import { provider } from '../../../constants/contract';



import { Pool } from '@uniswap/v3-sdk'; // OH LOOK, A PRE-MADE POOL CLASS





// export async function getAllPools(): Promise<Pool[]> {
export async function getAllPools(): Promise<string[]> {    
    // Get the addresses of all the deployed Uniswap V3 factories
    const uniswapV3Factories = Object.values(uniswapV3Factory);
    // let deployedPools: Pool[] = []; //Fill this out at some point, but for now just get the addresses of the deployed pools
    let deployedPools: string[] = [];

    for (const exchange of uniswapV3Factories) {
        const factory = new ethers.Contract(exchange, AlgebraFactory, provider);
        const blockNumber = await provider.getBlockNumber();
        const filter = {
            address: factory.address,
            // topics: [
            //     utils.id("Pool(address, address, address)"),
            // ],
            fromBlock: blockNumber - 10,
            toBlock: blockNumber -1,
        }

        const events = await provider.getLogs(filter);
        events.forEach((event) => {
            const poolAddress = event.topics[1];
            deployedPools.push(poolAddress);
        });

        // Log the addresses of the deployed pools
        console.log(`Deployed pool addresses: ${deployedPools}`);
    }

    return deployedPools;
}

getAllPools();