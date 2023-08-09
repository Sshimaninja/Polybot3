import { ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { wallet } from '../../constants/contract'

export class SmartPair {

    tokenInsymbol: string;
    tokenOutsymbol: string;

    tokenInID: string;
    tokenOutID: string;

    tokenIndec: number;
    tokenOutdec: number;

    ticker: string;
    poolA_id: Promise<string>;
    poolB_id: Promise<string>;

    exchangeA: string;
    exchangeB: string;

    factoryA_id: string;
    factoryB_id: string;

    pair0: ethers.Contract | undefined;
    pair1: ethers.Contract | undefined;

    slippageTolerance!: BN; //| undefined = BN(0.01);

    constructor(pool: any, slippageTolerance: BN) {
        this.tokenInsymbol = pool.pair.token0symbol;
        this.tokenOutsymbol = pool.pair.token1symbol;
        this.tokenInID = pool.pair.token0;
        this.tokenOutID = pool.pair.token1;
        this.tokenIndec = pool.pair.token0decimals;
        this.tokenOutdec = pool.pair.token1decimals;
        this.ticker = this.tokenInsymbol + "/" + this.tokenOutsymbol;
        this.factoryA_id = pool.SUSHIV2.factoryID;
        this.factoryB_id = pool.QUICKV2.factoryID;
        const factoryA = new ethers.Contract(this.factoryA_id, IFactory, wallet)
        const factoryB = new ethers.Contract(this.factoryB_id, IFactory, wallet)
        this.poolA_id = factoryA.getPair(this.tokenInID, this.tokenOutID);
        this.poolB_id = factoryB.getPair(this.tokenInID, this.tokenOutID);

        slippageTolerance = BN(slippageTolerance); //smaller slippage == smaller sized trades == more opportunities, though maybe not profitable.

        this.exchangeA = 'QUICK';
        this.exchangeB = 'SUSHI';
    }


    async getPoolAId() {
        return await this.poolA_id;
    }

    async getPoolBId() {
        return await this.poolB_id;
    }

    async getPair0() {
        return new ethers.Contract(await this.poolA_id, IPair, wallet)
    }

    async getPair1() {
        return new ethers.Contract(await this.poolB_id, IPair, wallet)
    }

}
