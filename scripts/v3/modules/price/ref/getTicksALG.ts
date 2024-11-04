import { abi as IAlgebraPool } from "@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json";
import { Contract } from "ethers";
import { provider } from "../../../../../constants/provider";

export interface ATick {
    liquidityTotal: bigint;
    liquidityDelta: bigint;
    outerFeeGrowth0Token: bigint;
    outerFeeGrowth1Token: bigint;
    prevTick: bigint;
    nextTick: bigint;
    outerSecondsPerLiquidity: bigint;
    outerSecondsSpent: bigint;
    hasLimitOrders: boolean;
}

export async function getTicks(tick: number, poolID: string): Promise<void> {
    const pool = new Contract(poolID, IAlgebraPool, provider);
    const isPool = await pool.getAddress();
    if (!isPool) {
        console.log("Pool does not exist");
        return;
    }
    const unlocked = await pool.unlocked();
    if (!unlocked) {
        console.log("Pool is locked");
        return;
    }
    const ticks = await pool.ticks(tick);
    return ticks;
}
