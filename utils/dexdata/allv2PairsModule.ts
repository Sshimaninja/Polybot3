import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IERC20 } from '@uniswap/v2-core/build/IERC20.json';
import { Contract, BigNumber } from "ethers";
import { FactoryMap, uniswapV2Factory, uniswapV3Factory } from "../../constants/addresses";
import { wallet } from "../../constants/contract";
import fs from "fs";


//A function which calls allPairs on each factory in the factoryMap and returns an array of all pairs by factory.
//Then compares tokens in each pair and returns an object of matching pairs.

export class AllV2PairsModule {
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

            async function validatePairs(factory: Contract): Promise<string[]> {
                const allPairsLen = await factory.allPairsLength();
                console.log('AllPairsLength: ' + allPairsLen);
                const pairs: string[] = [];
                await Promise.all(
                    Array.from({ length: allPairsLen.toNumber() }, (_, i) => i).map(async (index) => {
                        const allPairs = await factory.allPairs(index);
                        pairs.push(allPairs);
                    })
                );

                // console.log('Pairs: ' + pairs);

                return pairs;
            }

            const pairs = await validatePairs(factory);
            if (pairs.length > 0) {
                console.log('Pairs: ' + pairs.length);
                const batchSize = 100;
                const batches: string[][] = [];
                for (let i = 0; i < pairs.length; i += batchSize) {
                    batches.push(pairs.slice(i, i + batchSize));
                }
                const validPairs = await batches.reduce(async (accPromise: Promise<any>, batch: string[]) => {
                    const acc = await accPromise;
                    const batchValidPairs = await Promise.all(
                        batch.map(async (pair: string) => { // add type annotation to pair parameter
                            const pairContract = new Contract(pair, IPair, wallet);
                            const reserves = await pairContract.getReserves();
                            if (reserves[0] > 1 && reserves[1] > 1) {
                                const token0id = await pairContract.token0();
                                const token1id = await pairContract.token1();

                                try {
                                    const token0 = new Contract(token0id, IERC20, wallet);
                                    const token1 = new Contract(token1id, IERC20, wallet);
                                    const token0Symbol = await token0.symbol();
                                    const token0Decimals = await token0.decimals();
                                    const token1Symbol = await token1.symbol();
                                    const token1Decimals = await token1.decimals();
                                    return {
                                        pair,
                                        token0: {
                                            id: token0.address,
                                            symbol: token0Symbol,
                                            decimals: token0Decimals,
                                        },
                                        token1: {
                                            id: token1.address,
                                            symbol: token1Symbol,
                                            decimals: token1Decimals,
                                        },
                                    };
                                } catch (err: any) {
                                    if (err.code.includes("CALL_EXCEPTION")) {
                                        // console.log("Caught CALL_EXCEPTION, skipping pair: " + pair)
                                        return
                                    } else {
                                        console.log(err)
                                    }
                                }

                            }
                        })
                    );
                    batchValidPairs.forEach((pair: any) => {
                        if (pair) {
                            acc[pair.pair] = pair;
                        }
                    });
                    return acc;
                }, Promise.resolve({}));
                console.log('Valid pairs done');
                // console.log(validPairs);
                return validPairs;
            }
        });
    };
}


