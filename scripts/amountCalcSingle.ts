import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { getRequiredTokenIn } from './modules/lowslipBN';
import { Pair, ReservesData } from "../constants/interfaces";
import { Prices } from "./modules/prices";
import { Token, Amounts } from "../constants/interfaces";
import { getAmountsOut, getAmountsIn } from './modules/getAmountsIOLocal';
import { HiLo, Difference } from "../constants/interfaces";

export class AmountCalculator {
    pair: Pair;
    token0: Token;
    token1: Token;
    price: Prices;
    reserves: ReservesData;
    hilo: HiLo | null = null;
    difference: Difference | null = null;
    slip: BN;

    tradeSize: BigNumber | null = null;
    amountOutJS: BigNumber | null = null;

    constructor(price: Prices, pair: Pair, slippageTolerance: BN) {
        this.reserves = price.reserves;
        this.pair = pair;
        this.price = price;
        this.slip = slippageTolerance
        this.token0 = pair.token0;
        this.token1 = pair.token1;
        this.tradeSize = null;
    }

    async getSizeBN(reserveIn: BN, reserveOut: BN, targetPrice: BN, slippage: BN): Promise<BN> {
        // This is set to determine how much token0 can be traded for token1, while only the specified slippage.
        const tradeSizeBN = await getRequiredTokenIn(reserveIn, reserveOut, targetPrice, slippage);
        return tradeSizeBN;
    }

    async getSizeJS(reserveIn: BN, reserveOut: BN, targetPrice: BN, slippage: BN): Promise<BigNumber> {
        let tradeSizeBN = await this.getSizeBN(reserveIn, reserveOut, targetPrice, slippage);
        let tradeSizeNumber = tradeSizeBN.toFixed(this.token0.decimals);
        const tradeSizeJS = utils.parseUnits(tradeSizeNumber, this.token0.decimals!);
        return tradeSizeJS;
    }

    async getAmounts(reservesIn: BN, reservesOut: BN, targetPrice: BN, slippage: BN): Promise<Amounts> {

        //How much token0 is needed to reach target (priceOut) from the opposing pool.
        let tradeSize = await this.getSizeJS(reservesIn, reservesOut, targetPrice, slippage);

        //How much this pool GETS OUT using tradeSize based on opposing priceOut to target price(+/-slippage) taking its own reseves into account.
        //Valid for trade.recipient, not valid for trade.loanPool
        let out = await getAmountsOut(tradeSize, utils.parseUnits(reservesIn.toFixed(this.token0.decimals), this.token0.decimals), utils.parseUnits(reservesOut.toFixed(this.token1.decimals), this.token1.decimals))

        let amountsOut: Amounts = {
            tradeSize: tradeSize,
            amountOutJS: out,
        }

        return amountsOut;
    }


}