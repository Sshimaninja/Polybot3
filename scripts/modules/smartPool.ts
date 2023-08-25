import { ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { Pool } from '../../constants/interfaces'
import { wallet } from '../../constants/contract'

export class SmartPool {
    ticker: string;

    tokenInsymbol: string;
    tokenOutsymbol: string;

    tokenInID: string;
    tokenOutID: string;

    tokenIndec: number;
    tokenOutdec: number;

    poolID: Promise<string>;

    exchange: string | undefined;

    factoryID: string;

    pair: ethers.Contract | undefined;

    // slippageTolerance!: BN; //| undefined = BN(0.01);

    constructor(pool: Pool, factoryID: string, exchange: string) {
        this.tokenInsymbol = pool.token0.symbol;
        this.tokenOutsymbol = pool.token1.symbol;
        this.tokenInID = pool.token0.id;
        this.tokenOutID = pool.token1.id;
        this.tokenIndec = pool.token0.decimals;
        this.tokenOutdec = pool.token1.decimals;
        this.ticker = pool.ticker;
        this.factoryID = factoryID;
        const factory = new ethers.Contract(this.factoryID, IFactory, wallet)
        this.poolID = factory.getPool(this.tokenInID, this.tokenOutID);

        this.exchange = exchange;

        // slippageTolerance = BN(slippageTolerance); //smaller slippage == smaller sized trades == more opportunities, though maybe not profitable.
    }


    async getPoolId() {
        return await this.poolID;
    }

    async poolContract() {
        return new ethers.Contract(await this.poolID, IPair, wallet)
    }

}
