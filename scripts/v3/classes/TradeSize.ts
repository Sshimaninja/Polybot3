import { Contract } from "ethers";
import { Bool3Trade, Slot0 } from "../../../constants/interfaces";
import { IRL } from "./InRangeLiquidity";
import { BigNumber as BN } from "bignumber.js";
import { sqrt } from "@uniswap/sdk-core";
import { slip } from "../../../constants/environment";
import { fu } from "../../modules/convertBN";
export class TradeSize {
    trade: Bool3Trade;
    constructor(trade: Bool3Trade) {
        this.trade = trade;
    }
    async tradeToPrice(): Promise<string> {
        //targetPrice 0.520670400977951207 + 0.519935327393096545 = 1.040605728371047752 / 2 = 0.520302864185523876
        let targetPrice = await this.subSlip(BN(this.trade.target.priceTarget));
        let reserveIn = BN(this.trade.target.state.reserves0.toString());
        let reserveOut = BN(this.trade.target.state.reserves1.toString());
        const currentPrice = BN(
            fu(this.trade.target.priceOut, this.trade.tokenOut.decimals),
        ); // 64133 / 123348 = 0.51993546713363816194830884975841
        const diff = targetPrice.minus(currentPrice); // 0.520302864185523876 - 0.51993546713363816194830884975841 = 0.00036739705188571405169115024159
        if (targetPrice.gt(currentPrice)) {
            console.log(
                "[tradeToPrice]: targetPrice must be lower than currentPrice or else tradeSize will be negative",
            );
            console.log(
                "[tradeToPrice]: currentPrice: ",
                currentPrice.toFixed(6),
                "targetPrice: ",
                targetPrice.toFixed(6),
            );
        }
        // Calculate the maximum trade size that would result in a slippage equal to slip
        const tradeSize = diff.multipliedBy(reserveIn); // 0.00036739705188571405169115024159 * 123348 = 45.285714285714285714285714285714
        const tradeSizeString = tradeSize.toFixed(this.trade.tokenIn.decimals);
        console.log(tradeSizeString);
        return tradeSizeString;
        //const maxTradeSize = await getMaxIn(reserveOut, slip); // 123348 * 0.002 = 246.696
        //if (tradeSize.gt(maxTradeSize)) {
        //    return tradeSize; // 45.285714285714285714285714285714
        //} else {
        //    return maxTradeSize; // 246.696
        //}
    }

    async subSlip(n: BN) {
        return n.minus(n.multipliedBy(slip));
    }
}

//tick_to_price(tick: number) {
//    return 1.0001 ** tick;
//}

//sqp96toPrices(sqpx96: bigint): { price0: number; price1: number } {
//    const Q96 = 2n ** 96n;
//    const sqrtPrice = Number((sqpx96 * Q96) / Q96);
//    const price0 = 1 / (sqrtPrice * sqrtPrice);
//    const price1 = sqrtPrice * sqrtPrice;
//    //console.log(
//    //    `sqrtPrice: ${sqrtPrice} price0: ${price0} price1: ${price1}`,
//    //);
//    return { price0, price1 };
//}

//async calculateVolume(): Promise<bigint> {
//    const s0t = await this.trade.target.inRangeLiquidity.getSlot0();
//    const s0l = await this.trade.loanPool.inRangeLiquidity.getSlot0();
//    const targetSqrtPriceX96 = s0t.sqrtPriceX96;
//    const loanPoolsqrtPriceX96 = s0l.sqrtPriceX96;
//    const targetLiquidity = this.trade.target.state.liquidity;
//    const deltaSqrtPrice = targetSqrtPriceX96 - loanPoolsqrtPriceX96;
//    console.log(`deltaSqrtPrice: ${deltaSqrtPrice}`);
//    const volume =
//        (targetLiquidity * deltaSqrtPrice) /
//        (loanPoolsqrtPriceX96 * targetSqrtPriceX96);
//    console.log(`Calculated volume: ${volume}`);
//    return volume;
//}

//calculateVolumeBN(
//    loanPoolsqrtPriceX96: bigint,
//    targetSqrtPriceX96: bigint,
//    liquidity: bigint,
//): bigint {
//    const lpsp96 = BN(loanPoolsqrtPriceX96.toString());
//    //console.log(`sp96: ${sp96}`);
//    const tsp96 = BN(targetSqrtPriceX96.toString());
//    //console.log(`tsp96: ${tsp96}`);
//    const l = BN(liquidity.toString());
//    const deltaSqrtPrice = tsp96.minus(sp96);
//    console.log(`deltaSqrtPrice: ${deltaSqrtPrice}`);
//    const volumeBN = l.times(deltaSqrtPrice).div(sp96.times(tsp96));
//    console.log(`Calculated volumeBN: ${volumeBN}`);
//    const volume: bigint = BigInt(volumeBN.toString());
//    console.log(`Calculated bigint volume: ${volume}`);
//    return volume;
//}
//const deltaSqrtPrice = targetSqrtPriceX96 - sqrtPriceX96;
//console.log(`deltaSqrtPrice: ${deltaSqrtPrice}`);
//const volume =
//    (liquidity * deltaSqrtPrice) / (sqrtPriceX96 * targetSqrtPriceX96);
//console.log(`Calculated volume: ${volume}`);
//return volume;

//calculateTargetPrice(/*sqrtPriceX96 priceA: number, priceB: number*/): number {
//    const p = (
//        this.trade.loanPool.priceOut + this.trade.target.priceOut /2 ,
//    );
//    return p;
//}

//    calculateTargetSqPriceX96(
//        sqrtPriceX96A: bigint,
//        sqrtPriceX96B: bigint,
//    ): bigint {
//        return sqrtPriceX96B - sqrtPriceX96A;
//    }

//    async getTradeSize() {
//        //const slot0LP = await this.trade.loanPool.pool.slot0();
//        //const slot0T = await this.trade.target.pool.slot0();

//        //const liqLP: bigint = slot0LP.liquidity;
//        //const liqT: bigint = slot0T.liquidity;

//        //const targetSqrtPriceX96 = sqrtPriceXT * sqrtPriceLP;
//        //console.log(`Target sqrtPriceX96: ${targetSqrtPriceX96}`);

//        //const volumeLoanPool = this.calculateVolumeBN(
//        //    sqrtPriceX96LP,
//        //    targetSqrtPriceX96,
//        //    liqLP,
//        //);
//        const volumeTarget = this.calculateVolume();

//        // Execute trades on poolA and poolB
//        //console.log(`Trade volume for loanPool: ${volumeLoanPool}`);
//        console.log(`Trade volume for target: ${volumeTarget}`);

//        return volumeTarget;
//        // Note: Add the logic to execute trades on Uniswap pools using ethers.js
//    }
//}
