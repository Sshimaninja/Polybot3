import { ethers } from 'ethers';
import { abi as AlgebraFactory} from '../../../interfaces/IAlgebraFactory.json'
import { algebraFactory } from '../../../constants/addresses';

import { Pool } from '@uniswap/v3-sdk'; // OH LOOK, A PRE-MADE POOL CLASS

export interface DeployedPools {
     poolAddress: string, 
     token0Address: string, 
     token1Address: string }



// export async function getAllPools(): Promise<Pool[]> {
export async function getAlgPools() {    
    // Get the addresses of all the deployed ALBEBRA factories (Basically identical to uniswapv3, but with)
    // const uniswapV3Factories = Object.values(uniswapV3Factory);
    // let deployedPools: Pool[] = []; //Fill this out at some point, but for now just get the addresses of the deployed pools
    // for (const exchange of uniswapV3Factories) {
        //We must use outside RPC because our private RPC is Sentry and doesn't store historical data. 
        const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.infura.io/v3/ae479bfaa1b54326a4770a0fe8aa801d")
        // console.log(exchange)
        const blockNumber = await provider.getBlockNumber();

        const batchSize = 10000;
        const factory = new ethers.Contract(algebraFactory.QUICK, AlgebraFactory, provider);
        console.log('check contract init factory.address', factory.address, 'blockNumber', blockNumber)

        const filter = {
            address: factory.address,
            // topics: [
            //     utils.id("Pool(address, address, address)"),
            // ],
            fromBlock: 0,
            toBlock: blockNumber,
        }
        const events = await provider.getLogs(filter);
     
        
        for (let i = 0; i < events.length; i += batchSize) {
            const poolAddresses = events.map((event) => {
                const parsedEvent = factory.interface.parseLog(event);
                const deployedPools = {
                    poolAddress: parsedEvent.args.pool,
                    token0Address: parsedEvent.args.token0,
                    token1Address: parsedEvent.args.token1
                };
                return deployedPools;
            });
        console.log('poolAddresses', poolAddresses);  
    }
}
getAlgPools();