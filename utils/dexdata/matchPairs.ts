import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IERC20 } from '@uniswap/v2-core/build/IERC20.json';
import { Contract, BigNumber } from "ethers";
import { FactoryMap, uniswapV2Factory, uniswapV3Factory } from "../../constants/addresses";
import { wallet } from "../../constants/contract";
import validQUICKpairs from "../../data/validPairs/validQUICKpairs.json";
import validSUSHIpairs from "../../data/validPairs/validSUSHIpairs.json";
import fs from "fs";


export class matchPairs {
    data: string[];

    constructor() {
        this.data = [];
    }

    async matchPairs() {
        this.data.forEach((pair: any) => {
            // const exchange = 
        })
    }



}