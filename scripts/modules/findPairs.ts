/* This doc will take subgraph fetched pairs from Uniswap or Sushiwap
and use those pairs to check against other uniswapv2 clones to see if
there are coresponding pairs on those clones. If there are, then we
will add those pairs to the list of pairs to be arbitrated. */

import { ethers } from 'ethers';
import { provider } from '../../constants/contract';
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IERC20 } from '@uniswap/v2-periphery/build/IERC20.json';
import { uniswapFactory } from '../../constants/addresses';
import { logger } from '../../constants/contract';
import pairdata from '../../utils/subgraph/pairs.json';

// export async function findPairs(pairdata: any) {
//     //For each factory in uniswapFactory run getPair on each factorycontract(
//     //For each token pair in pairdata
//     //)
//     let getPairforFactory = async (pairdata: any, factory: string) => {
//         let pair = undefined;
//         pairdata.V2V2.map(async (data) => {
//             let array = uniswapFactory
//             const factoryContract = new ethers.Contract(array.forEach(element => {
//                 (uniswapFactory)
//             }), IFactory, provider);
//             const pair = await factoryContract.getPair(data.token0, data.token1);
//             if (pair != undefined) {
//                 logger.info(`Pair found for ${data.token0} and ${data.token1} on ${factory}`);
//                 return pair;
//             }
//         });
//         if (getPairforFactory(pairdata, uniswapFactory.SUSHI) != undefined) {

//             pairdata.V2V2.map(async (data) => {
//                 // `           const pair = new ethers.Contract(data.pair, IPair, provider)
//             })

//         }
//     }
// }
