import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IERC20 } from '@uniswap/v2-core/build/IERC20.json';
import { Contract, utils, BigNumber } from "ethers";
import { FactoryMap, RouterMap, uniswapV2Factory, uniswapV3Factory } from "../../../constants/addresses";
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
    routerMap: RouterMap;

    constructor(factoryMap: FactoryMap, routerMap: RouterMap) {
        this.factoryMap = factoryMap;
        this.routerMap = routerMap;
    }

    async getPairs(): Promise<any> {
        Object.keys(this.factoryMap).forEach(async (protocol) => {
            console.log('Starting');
            const factoryID = this.factoryMap[protocol];
            const routerID = this.routerMap[protocol]
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

                        if (reserves[0].gt(BigNumber.from(1)) && reserves[1].gt(BigNumber.from(1)) && blockTimeStampLast > (block - 40000 * 12)) {
                            const token0id = await pairContract.token0();
                            const token0 = new Contract(token0id, IERC20, wallet)

                            const token1id = await pairContract.token1();
                            const token1 = new Contract(token1id, IERC20, wallet)

                            try {
                                const token0Symbol = await token0.symbol();
                                const token0Decimals = await token0.decimals();
                                const token1Symbol = await token1.symbol();
                                const token1Decimals = await token1.decimals();
                                const ticker = `${token0Symbol}/${token1Symbol}`;
                                console.log('Pair: ' + pair);
                                console.log('Last: ' + blockTimeStampLast)
                                console.log('Current: ' + currentBlockTimestamp)
                                console.log('Symbol: ' + ticker)
                                console.log('Token0: ' + token0id);
                                console.log('reserves0: ' + utils.formatUnits(reserves[0], token0Decimals))
                                console.log('Token1: ' + token1id);
                                console.log('reserves1: ' + utils.formatUnits(reserves[1], token1Decimals))
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
                    const factoryPair = [{
                        exchange: protocol,
                        factoryID: factoryID,
                        routerID: routerID,
                        pairs: validPairs,
                    }]
                    fs.writeFileSync(pairsFile, JSON.stringify(factoryPair, null, 2) + '\n');
                    console.log(`Valid pairs: ${validPairs.length}`);
                    console.log(`Valid pairs written to ${pairsFile}`);
                }
                await validatePairs();
            }
            await getAllPairs(factory);
        });

    }
}