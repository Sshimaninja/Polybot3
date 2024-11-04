import { ethers, Contract } from "ethers";
import { Pool, Position, TickMath, nearestUsableTick } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { signer } from "../../../constants/provider";
import {
    ReservesData,
    PoolStateV3,
    PoolInfo,
    ERC20token,
    Slot0,
    Reserves3,
} from "../../../constants/interfaces";
import { abi as IERC20 } from "../../../interfaces/IERC20.json";
import { chainID } from "../../../constants/addresses";
import { slippageTolerance } from "../control";
import { log } from "console";
import { V3Quote } from "../modules/price/v3Quote";
import JSBI from "jsbi";
export interface IRL {
    pool: string;
    fee: number;
    exchange: string;
    sqrtRatioLow: number;
    sqrtRatioHigh: number;
    sqrtPrice: number;
    price0: number;
    price1: number;
    liquidity: JSBI;
    tickLow: number;
    tickHigh: number;
    tickSpacing: number;
    reserves0: JSBI;
    reserves1: JSBI;
}

export interface Prices {
    exchange: string;
    ticker: string;
    priceOut: JSBI;
    priceIn: JSBI;
}

export class InRangeLiquidity {
    static liquidity: JSBI[] = [];
    poolInfo: PoolInfo;
    pool: Contract;
    token0: ERC20token;
    token1: ERC20token;
    token0Contract: Contract;
    token1Contract: Contract;
    constructor(
        poolInfo: PoolInfo,
        pool: Contract,
        token0: ERC20token,
        token1: ERC20token,
    ) {
        this.pool = pool;
        this.poolInfo = poolInfo;
        this.token0 = token0;
        this.token1 = token1;
        this.token0Contract = new Contract(token0.id, IERC20, signer);
        this.token1Contract = new Contract(token1.id, IERC20, signer);
    }

    async getIRL(): Promise<IRL> {
        const slot0 = await this.getSlot0();
        const sqrtPriceX96 = slot0.sqrtPriceX96;
        const liquidity = await this.pool.liquidity();
        const fee = await this.pool.fee();

        // Define tokens
        const token0 = new Token(
            chainID.POLYGON,
            this.token0.id,
            this.token0.decimals,
            this.token0.symbol,
            //this.token0.name,
        );
        const token1 = new Token(
            chainID.POLYGON,
            this.token1.id,
            this.token1.decimals,
            this.token1.symbol,
            //this.token1.name,
        );

        // Create a Pool instance
        const pool = new Pool(
            token0,
            token1,
            fee,
            sqrtPriceX96.toString(),
            liquidity.toString(),
            slot0.tick,
        );

        let currentTick: number = Number(slot0.tick);
        let tickSpacing: number = Number(this.poolInfo.tickSpacing);

        // Define the position
        let tickLow: number =
            nearestUsableTick(currentTick, tickSpacing) - tickSpacing * 2;
        let tickHigh: number =
            nearestUsableTick(currentTick, tickSpacing) + tickSpacing * 2;
        const position = new Position({
            pool,
            liquidity: liquidity.toString(),
            tickLower: tickLow,
            tickUpper: tickHigh,
        });

        // Calculate in-range liquidity
        const inRangeLiquidity = position.liquidity;

        // Calculate reserves per asset
        const reserves0 = position.amount0.toSignificant(6);
        const reserves1 = position.amount1.toSignificant(6);

        // Calculate prices
        const price0 = pool.token0Price.toSignificant(6);
        const price1 = pool.token1Price.toSignificant(6);

        let r: IRL = {
            pool: this.token0.symbol + "/" + this.token1.symbol,
            fee: this.poolInfo.fee,
            exchange: this.poolInfo.exchange,
            sqrtRatioLow: Math.sqrt(1.0001 ** tickLow),
            sqrtRatioHigh: Math.sqrt(1.0001 ** tickHigh),
            sqrtPrice: Number(sqrtPriceX96),
            price0: Number(price0),
            price1: Number(price1),
            liquidity: JSBI.BigInt(inRangeLiquidity.toString()),
            tickLow: tickLow,
            tickHigh: tickHigh,
            tickSpacing: tickSpacing,
            reserves0: JSBI.BigInt(reserves0),
            reserves1: JSBI.BigInt(reserves1),
        };

        return r;
    }

    async getSlot0(): Promise<Slot0> {
        let s0: Slot0 = {
            sqrtPriceX96: JSBI.BigInt(0),
            tick: 0,
            fee: 0,
            unlocked: false,
        };
        try {
            if (this.poolInfo.protocol === "UNIV3") {
                const slot0 = await this.pool.slot0();
                s0 = {
                    sqrtPriceX96: JSBI.BigInt(slot0.sqrtPriceX96.toString()),
                    tick: slot0.tick,
                    fee: await this.pool.fee(),
                    unlocked: slot0.unlocked,
                };
                return s0;
            } else if (this.poolInfo.protocol === "ALG") {
                const slot0 = await this.pool.globalState();
                s0 = {
                    sqrtPriceX96: JSBI.BigInt(slot0.price.toString()),
                    tick: slot0.tick,
                    fee: slot0.fee,
                    unlocked: slot0.unlocked,
                };
                return s0;
            }
        } catch (error: any) {
            console.log(
                "Error in " +
                    this.poolInfo.protocol +
                    " getPoolState: " +
                    error.message,
            );
            return s0;
        }
        return s0;
    }
}
