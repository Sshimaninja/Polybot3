import { Contract } from "ethers";
import { Bool3Trade, Slot0 } from "../../../constants/interfaces";
import { IRL } from "./IRL";
import JSBI from "jsbi";
import { sqrt } from "@uniswap/sdk-core";
import { slip } from "../../../constants/environment";

export class TradeSize {
    trade: Bool3Trade;

    constructor(trade: Bool3Trade) {
        this.trade = trade;
    }

    async tradeToPrice(): Promise<string> {
        // targetPrice 0.520670400977951207 + 0.519935327393096545 = 1.040605728371047752 / 2 = 0.520302864185523876
        let targetPrice = await this.subSlip(
            JSBI.BigInt(this.trade.target.priceTarget.toString()),
        );
        let reserveIn = JSBI.BigInt(
            this.trade.target.state.reserves0.toString(),
        );
        let reserveOut = JSBI.BigInt(
            this.trade.target.state.reserves1.toString(),
        );
        const currentPrice = JSBI.BigInt(this.trade.target.priceOut.toString());

        // 64133 / 123348 = 0.51993546713363816194830884975841
        const diff = JSBI.subtract(targetPrice, currentPrice); // 0.520302864185523876 - 0.51993546713363816194830884975841 = 0.00036739705188571405169115024159

        if (JSBI.greaterThan(targetPrice, currentPrice)) {
            console.log(
                "[tradeToPrice]: targetPrice must be lower than currentPrice or else tradeSize will be negative",
            );
            console.log(
                "[tradeToPrice]: currentPrice: ",
                currentPrice.toString(),
                "targetPrice: ",
                targetPrice.toString(),
            );
        }

        // Calculate the maximum trade size that would result in a slippage equal to slip
        const tradeSize = JSBI.multiply(diff, reserveIn); // 0.00036739705188571405169115024159 * 123348 = 45.285714285714285714285714285714
        const tradeSizeString = tradeSize.toString();
        console.log(tradeSizeString);
        return tradeSizeString;
    }

    async subSlip(n: JSBI): Promise<JSBI> {
        const slipJSBI = JSBI.BigInt(slip.toString());
        const slipAmount = JSBI.divide(
            JSBI.multiply(n, slipJSBI),
            JSBI.BigInt(10000),
        ); // Assuming slip is a percentage in basis points
        return JSBI.subtract(n, slipAmount);
    }
}
