import { ethers, Contract } from "ethers";
import { InRangeLiquidity } from "../../../classes/InRangeLiquidity";
import { ERC20token } from "../../../../../constants/interfaces";
import { TickMath } from "@uniswap/v3-sdk";
import { JSBI } from "@uniswap/sdk";
("@uniswap/sdk-core/node_modules/jsbi");

export class VolToTarget {
    exchange: string;
    token0: ERC20token;
    token1: ERC20token;
    pool: Contract;
    //data: InRangeLiquidity;
    sPriceTarget: number;

    constructor(
        exchange: string,
        token0: ERC20token,
        token1: ERC20token,
        pool: Contract,
        //data: InRangeLiquidity,
        sPriceTarget: number,
    ) {
        this.exchange = exchange;
        this.token0 = token0;
        this.token1 = token1;
        this.pool = pool;
        //this.data = data;
        this.sPriceTarget = sPriceTarget;
    }

    // Calculate the amount of token0 needed to move the price from sp to sb
    x_in_range(L: JSBI, sp: JSBI, sb: JSBI): JSBI {
        return JSBI.divide(
            JSBI.multiply(L, JSBI.subtract(sb, sp)),
            JSBI.multiply(sp, sb),
        );
    }

    // Calculate the amount of token1 needed to move the price from sp to sa
    y_in_range(L: JSBI, sp: JSBI, sa: JSBI): JSBI {
        return JSBI.multiply(L, JSBI.subtract(sp, sa));
    }

    // Convert a BigNumber to JSBI
    bigNumberToJSBI(bn: bigint): JSBI {
        return JSBI.BigInt(bn.toString());
    }

    // Convert a number to JSBI
    toJSBI(num: number): JSBI {
        return JSBI.BigInt(num);
    }

    // Calculate the required token0 volume to reach the target price across multiple tick ranges
    async calcVolToTarget(): Promise<bigint> {
        const s = await this.data.getIRL();
        let sPriceCurrent = this.toJSBI(Number(s.sqrtPrice));
        let liquidity = this.toJSBI(Number(s.liquidity));
        let currentTick = JSBI.BigInt(
            TickMath.getTickAtSqrtRatio(sPriceCurrent),
        );
        //let targetTick = TickMath.getTickAtSqrtRatio(
        //    this.toJSBI(this.sPriceTarget),
        //);
        let tickSpacing = this.toJSBI(s.tickSpacing);

        let requiredToken0Volume = JSBI.BigInt(0);

        while (JSBI.lessThan(sPriceCurrent, this.toJSBI(this.sPriceTarget))) {
            // Calculate the next tick range
            let nextTick = JSBI.add(currentTick, tickSpacing);
            let sPriceNext = TickMath.getSqrtRatioAtTick(Number(nextTick));

            // If the target price is within the next tick range, adjust the price range
            if (JSBI.greaterThan(sPriceNext, this.toJSBI(this.sPriceTarget))) {
                sPriceNext = this.toJSBI(this.sPriceTarget);
            }

            // Calculate the amount of token0 required to move to the next tick range or the target price
            let volume = this.x_in_range(liquidity, sPriceCurrent, sPriceNext);
            requiredToken0Volume = JSBI.add(requiredToken0Volume, volume);

            // Update current price and tick
            sPriceCurrent = sPriceNext;
            currentTick = nextTick;
            console.log("requiredToken0Volume: ", requiredToken0Volume);

            // Fetch new liquidity if moving to the next tick range
            if (!JSBI.equal(sPriceCurrent, this.toJSBI(this.sPriceTarget))) {
                liquidity = this.bigNumberToJSBI(
                    await this.getLiquidityForTickRange(currentTick, nextTick),
                );
            }
        }
        function jsbiToBigInt(jsbiValue: JSBI): bigint {
            return BigInt(jsbiValue.toString());
        }
        let X = jsbiToBigInt(requiredToken0Volume);
        return X;
    }

    // Fetch liquidity for a specific tick range
    async getLiquidityForTickRange(
        tickLower: JSBI,
        tickUpper: JSBI,
    ): Promise<bigint> {
        // Example of fetching liquidity - you will need to adjust this based on your actual contract methods
        const liquidity = await this.pool.liquidity();
        return liquidity;
    }
}
