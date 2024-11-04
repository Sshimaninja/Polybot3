import JSBI from "jsbi";
import { Contract } from "ethers";
class TradeMath {
    tickLower: bigint;
    sPriceUpper: bigint;
    tickSpacing: bigint;
    decimalsIn: number;
    decimalsOut: number;
    pool: Contract;
    sCurrentPrice: bigint;
    sPriceTarget: bigint;
    liquidity: bigint;

    constructor(
        pool: Contract,
        sCurrentPrice: bigint,
        sPriceTarget: bigint,
        liquidity: bigint,
        tickLower: bigint,
        sPriceUpper: bigint,
        tickSpacing: bigint,
        decimalsIn: number,
        decimalsOut: number,
    ) {
        this.pool = pool;
        this.sCurrentPrice = sCurrentPrice;
        this.sPriceTarget = sPriceTarget;
        this.liquidity = liquidity;
        this.tickLower = tickLower;
        this.sPriceUpper = sPriceUpper;
        this.tickSpacing = tickSpacing;
        this.decimalsIn = decimalsIn;
        this.decimalsOut = decimalsOut;
    }

    async tradeToPrice(
        targetPrice: JSBI,
        currentPrice: JSBI,
        liq: JSBI,
    ): Promise<JSBI> {
        const priceDiff = JSBI.subtract(targetPrice, currentPrice);
        const amountIn = JSBI.multiply(priceDiff, liq);
        if (JSBI.lessThanOrEqual(targetPrice, currentPrice)) {
            console.log("targetPrice lt currentPrice, returning 0");
            return JSBI.BigInt(0);
        } else {
            return amountIn;
        }
    }

    async sqrt(x: JSBI): Promise<JSBI> {
        let z = JSBI.divide(
            JSBI.add(x, JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))),
            JSBI.BigInt(2),
        );
        let y = x;
        while (JSBI.greaterThan(JSBI.subtract(z, y), JSBI.BigInt(0))) {
            y = z;
            z = JSBI.divide(JSBI.add(JSBI.divide(x, z), z), JSBI.BigInt(2));
        }
        return y;
    }
}
