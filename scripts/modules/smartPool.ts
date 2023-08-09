import { ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { wallet } from '../../constants/contract'

export class SmartPool {

    tokenInsymbol: string;
    tokenOutsymbol: string;

    tokenInID: string;
    tokenOutID: string;

    tokenIndec: number;
    tokenOutdec: number;

    ticker: string;
    poolID: Promise<string>;

    exchange: number;

    factoryID: string;

    pair: ethers.Contract | undefined;

    slippageTolerance!: BN; //| undefined = BN(0.01);

    constructor(pool: any, slippageTolerance: BN) {
        this.tokenInsymbol = pool.pair.token0symbol;
        this.tokenOutsymbol = pool.pair.token1symbol;
        this.tokenInID = pool.pair.token0;
        this.tokenOutID = pool.pair.token1;
        this.tokenIndec = pool.pair.token0decimals;
        this.tokenOutdec = pool.pair.token1decimals;
        this.ticker = this.tokenInsymbol + "/" + this.tokenOutsymbol;
        this.factoryID = pool[1].factoryID;
        const factory = new ethers.Contract(this.factoryID, IFactory, wallet)
        this.poolID = factory.getPair(this.tokenInID, this.tokenOutID);

        this.exchange = pool[1];

        slippageTolerance = BN(slippageTolerance); //smaller slippage == smaller sized trades == more opportunities, though maybe not profitable.
    }


    async getPoolId() {
        return await this.poolID;
    }

    async poolContract() {
        return new ethers.Contract(await this.poolID, IPair, wallet)
    }

}
