import { Contract, utils } from "ethers";
import { FactoryMap, RouterMap, uniswapV3Factory } from "../../../constants/addresses";
import { wallet } from "../../../constants/contract";
import { provider } from "../../../constants/contract";
import fs from "fs";
import { abi as IUniswapV3Factory } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json';
import { abi as IERC20 } from '@uniswap/v3-core/artifacts/contracts/interfaces/IERC20Minimal.sol/IERC20Minimal.json';

export class AllV3Pairs {
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
            const factory = new Contract(factoryID, IUniswapV3Factory, wallet);
            if (factory.address != undefined) {
                console.log('FactoryContract Initialised: ' + factory.address);
            } else {
                console.log('FactoryContract not initialised');
            }

            async function getAllPairs(factory: Contract) {
                const validPairs: any[] = [];
                const pairsFile = `./data/validPairs/V3/${protocol}.json`;


                // This is pretty clever. It uses the logic you would expect, but unfortunately, that isn't logic that exists. I'll need to tie this into the allv2Pairs.ts file.
                // Get all tokens for this factory
                const allTokens = await factory.allTokens(0, 1000000);
                console.log(`All tokens: ${allTokens}`);

                // Get all pairs for each token
                for (let i = 0; i < allTokens.length; i++) {
                    const token0 = allTokens[i];
                    for (let j = i + 1; j < allTokens.length; j++) {
                        const token1 = allTokens[j];
                        const poolAddress = await factory.getPool(token0, token1);
                        if (poolAddress != "0x0000000000000000000000000000000000000000") {
                            const poolContract = new Contract(poolAddress, IERC20, wallet);
                            const token0Symbol = await poolContract.symbol();
                            const token0Decimals = await poolContract.decimals();
                            const token1Symbol = await poolContract.symbol();
                            const token1Decimals = await poolContract.decimals();
                            const ticker = `${token0Symbol}/${token1Symbol}`;
                            console.log('Pool: ' + poolAddress);
                            console.log('Symbol: ' + ticker)
                            console.log('Token0: ' + token0);
                            console.log('Token1: ' + token1);
                            const tokenData = {
                                ticker: ticker,
                                poolID: poolAddress,
                                token0: {
                                    symbol: token0Symbol,
                                    id: token0,
                                    decimals: token0Decimals,
                                },
                                token1: {
                                    symbol: token1Symbol,
                                    id: token1,
                                    decimals: token1Decimals,
                                },
                            };
                            validPairs.push(tokenData);
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
            getAllPairs(factory);
        });
    }
}