import { ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { wallet } from '../../constants/contract'
import { SmartPool } from "./smartPool";
import { FactoryPair, Pair } from "../../constants/interfaces";
import { Reserves } from "./reserves";
import { Prices } from "./prices";
import { RouterMap } from "../../constants/addresses";

/*

NOTE: This SmartPair SHOULD BE already organized by price, 
therefore the 'tokenIn' SHOULD BE the [lower] priced token an one exchange,
and the 'tokenOut' SHOULD BE the higher priced token on the other exchange.

*/


export class SmartPair {

    ticker: string | undefined;

    exchangeA: string;
    exchangeB: string;

    tokenInsymbol: string | undefined;
    tokenOutsymbol: string | undefined;

    tokenInID: string | undefined;
    tokenOutID: string | undefined;

    tokenIndec: number | undefined;
    tokenOutdec: number | undefined;

    pairA_id: string | undefined;
    pairB_id: string | undefined;

    factoryA_id: string;
    factoryB_id: string;

    routerA_id: string;
    routerB_id: string;

    Pair0: ethers.Contract | undefined;
    Pair1: ethers.Contract | undefined;

    reserves0: Promise<string[]> | undefined
    reserves1: Promise<string[]> | undefined


    slippageTolerance: BN; //| undefined = BN(0.01);

    constructor(pair: FactoryPair, match: Pair, reserves: Reserves, prices: Prices, routerMap: RouterMap, slippageTolerance: BN) {

        pair.matches.forEach((pair: Pair) => {
            this.pairA_id = pair.poolA_id;
            this.pairB_id = pair.poolB_id;
            this.tokenInsymbol = pair.token0.symbol;
            this.tokenOutsymbol = pair.token1.symbol;
            this.tokenInID = pair.token0.id;
            this.tokenOutID = pair.token1.id;
            this.tokenIndec = pair.token0.decimals;
            this.tokenOutdec = pair.token1.decimals;
            this.ticker = this.tokenInsymbol + "/" + this.tokenOutsymbol;
            this.Pair0 = new ethers.Contract(pair.poolA_id, IPair, wallet)
            this.Pair1 = new ethers.Contract(pair.poolB_id, IPair, wallet)
            this.reserves0 = this.Pair0.getReserves();
            this.reserves1 = this.Pair1.getReserves();
            //     this.matches0 = new ethers.Contract(pair.poolA_id, IPair, wallet)
            //     this.matches1 = new ethers.Contract(pair.poolB_id, IPair, wallet)
        })
        this.routerA_id = routerMap[pair.exchangeA];
        this.routerB_id = routerMap[pair.exchangeB];
        this.factoryA_id = pair.factoryA_id
        this.factoryB_id = pair.factoryB_id
        const factoryA = new ethers.Contract(this.factoryA_id, IFactory, wallet)
        const factoryB = new ethers.Contract(this.factoryB_id, IFactory, wallet)
        // this.pairA_id = factoryA.getPair(this.tokenInID, this.tokenOutID);
        // this.pairB_id = factoryB.getPair(this.tokenInID, this.tokenOutID);

        this.slippageTolerance = BN(slippageTolerance); //smaller slippage == smaller sized trades == more opportunities, though maybe not profitable.

        this.exchangeA = pair.exchangeA;
        this.exchangeB = pair.exchangeB;
    }


    // async getPoolAId() {
    //     return await this.pairA_id;
    // }

    // async getPoolBId() {
    //     return await this.pairB_id;
    // }

    // async pair0() {
    //     return new ethers.Contract(await this.pairA_id!, IPair, wallet)
    // }

    // async pair1() {
    //     return new ethers.Contract(await this.pairB_id!, IPair, wallet)
    // }

    // async reserves() {
    //     let reserves0 = await this.Pair0.getReserves();
    //     let reserves1 = await this.Pair1.getReserves();
    //     return [reserves0, reserves1];
    // }


}
