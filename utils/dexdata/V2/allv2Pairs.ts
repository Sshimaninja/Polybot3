import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IERC20 } from '@uniswap/v2-core/build/IERC20.json';
import { Contract, BigNumber } from "ethers";
import { FactoryMap, uniswapV2Factory, uniswapV3Factory } from "../../../constants/addresses";
import { wallet } from "../../../constants/contract";
import { provider } from "../../../constants/contract";
import fs from "fs";

/* 

A function which calls allPairs on each factory in the factoryMap and returns an array of all pairs by factory.
Then compares tokens in each pair and returns an object of matching pairs.

TODO: UPDATE this so that it outputs SmartPool objects to the file, instead of the current loose format.
Either that or update the flashit/swap functions to accept this format instead (which is built to make a smaller database, so might be best.)

*/
export class AllV2Pairs {
    factoryMap: FactoryMap;

    constructor(factoryMap: FactoryMap) {
        this.factoryMap = factoryMap;
    }

    async getPairs(): Promise<any> {
        Object.keys(this.factoryMap).forEach(async (protocol) => {
            console.log('Starting');
            const factoryID = this.factoryMap[protocol];
            console.log('FactoryID: ' + factoryID);
            const factory = new Contract(factoryID, IFactory, wallet);
            if (factory.address != undefined) {
                console.log('FactoryContract Initialised: ' + factory.address);
            } else {
                console.log('FactoryContract not initialised');
            }

            async function getAllPairs(factory: Contract) {
                const allPairsLen = await factory.allPairsLength();
                console.log('AllPairsLength: ' + allPairsLen);
                const pairs: string[] = [];
                await Promise.all(
                    Array.from({ length: allPairsLen.toNumber() }, (_, i) => i).map(async (index) => {
                        const allPairs = await factory.allPairs(index);
                        pairs.push(allPairs);
                    })
                );
                const subsetPairs = pairs.flat().slice(0, 30);//TESTING
                // console.log('Pairs: ' + pairs);
                const validPairs: any[] = [];

                async function validatePairs() {
                    const pairsFile = `./data/validPairs/V2/${protocol}.json`;
                    for (const pair of subsetPairs) {
                        const pairContract = new Contract(pair, IPair, wallet);
                        // console.log('PairContract: ' + pairContract.address);

                        const reserves = await pairContract.getReserves();
                        // console.log(reserves);
                        const blockTimeStampLast = reserves[2]
                        const currentBlockNumber = await provider.getBlockNumber();
                        const currentBlock = await provider.getBlock(currentBlockNumber);
                        const currentBlockTimestamp = currentBlock.timestamp
                        const block = currentBlockTimestamp;
                        // console.log('Block: ' + block);

                        if (reserves[0] > 10 && reserves[1] > 10 && blockTimeStampLast > (currentBlockTimestamp - 3000)) {
                            console.log('Pair: ' + pair);
                            console.log('Last: ' + blockTimeStampLast)
                            console.log('Current: ' + currentBlockTimestamp)
                            const token0id = await pairContract.token0();
                            console.log('Token0: ' + token0id);
                            const token1id = await pairContract.token1();
                            console.log('Token1: ' + token1id);
                            try {
                                const token0 = new Contract(token0id, IERC20, wallet);
                                const token1 = new Contract(token1id, IERC20, wallet);
                                const token0Symbol = await token0.symbol();
                                const token0Decimals = await token0.decimals();
                                const token1Symbol = await token1.symbol();
                                const token1Decimals = await token1.decimals();
                                const ticker = `${token0Symbol}/${token1Symbol}`;
                                const tokenData = {
                                    ticker: ticker,
                                    poolID: pair,
                                    token0: {
                                        symbol: token0Symbol,
                                        id: token0.address,
                                        decimals: token0Decimals,
                                    },
                                    token1: {
                                        symbol: token1Symbol,
                                        id: token1.address,
                                        decimals: token1Decimals,
                                    },
                                };
                                validPairs.push(tokenData);
                            } catch (e) {
                                console.log(`Error getting token data for pair ${pair}: ${e}\n skipping...`);
                            }
                        }
                    }
                    const factoryPair = {
                        exchange: protocol,
                        factoryID: factoryID,
                        pairs: validPairs,
                    }
                    fs.appendFileSync(pairsFile, JSON.stringify(factoryPair, null, 2) + '\n');
                    console.log(`Valid pairs: ${validPairs.length}`);
                    console.log(`Valid pairs written to ${pairsFile}`);
                }
                await validatePairs();
            }
            await getAllPairs(factory);
        });

    }


}