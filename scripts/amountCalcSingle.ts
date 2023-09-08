import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
// import { Reserves } from "./modules/reserves";
import { logger } from '../constants/contract'
import { lowSlippage } from './modules/lowslipBN';
// import { ReserveData } from "./modules/reserveData";
import { Pair, ReservesData } from "../constants/interfaces";
import { Reserves } from "./modules/reserves";
import { Prices } from "./modules/prices";
import { Token, Amounts } from "../constants/interfaces";
import { getAmountsOut, getAmountsIn } from './modules/getAmountsIOjs';
import { HiLo, Difference } from "../constants/interfaces";
import { getDifference, getGreaterLesser, getHiLo } from './modules/getHiLo';

export class AmountCalculator {
    pair: Pair;
    token0: Token;
    token1: Token;
    price: Prices;
    reserves: ReservesData;
    hilo: HiLo | null = null;
    difference: Difference | null = null;
    slip: BN;
    amountLowSlippage: BN | undefined;

    tradeSizeBN: BN
    tradeSizeJS: BigNumber

    amountOutJS: BigNumber;
    amountRepayJS: BigNumber;

    constructor(price: Prices, pair: Pair, slippageTolerance: BN) {
        this.reserves = price.reserves;
        this.pair = pair;
        this.price = price;
        this.slip = slippageTolerance
        this.token0 = pair.token0;
        this.token1 = pair.token1;
        this.amountLowSlippage = BN(0);
        this.tradeSizeJS = utils.parseUnits("0", this.token0.decimals!);
        this.tradeSizeBN = BN(0);
        this.amountOutJS = utils.parseUnits("0", this.token1.decimals!);
        this.amountRepayJS = utils.parseUnits("0", this.token1.decimals!);
    }

    async getTradeAmountBN(): Promise<BN> {
        // This is set to determine how much of own token0 can be traded for token1, causing only the specified slippage.
        this.amountLowSlippage = await lowSlippage(this.price.reserves.reserveInBN, this.price.reserves.reserveOutBN, this.price.priceOutBN, this.slip);
        this.tradeSizeBN = this.amountLowSlippage//.toFixed(this.sp.tokenIndec);
        // this.tradeSize = BN.min(this.amountIn, this.amountInB)//.toFixed(this.sp.tokenIndec)
        return this.tradeSizeBN;
    }

    async getTradeAmountJS(): Promise<BigNumber> {
        let tradeSizeBN = await this.getTradeAmountBN();
        let tradeSizeNumber = tradeSizeBN.toFixed(this.token0.decimals);
        this.tradeSizeJS = utils.parseUnits(tradeSizeNumber, this.token0.decimals!);
        return this.tradeSizeJS;
    }

    async getAmounts(): Promise<Amounts> {

        let tradeSize = await this.getTradeAmountJS();

        const out = this.amountOutJS = await getAmountsOut(tradeSize, this.price.reserves.reserveIn, this.price.reserves.reserveOut!)

        let amountsOut: Amounts = {
            tradeSize: tradeSize,
            amountOutJS: out,
        }
        return amountsOut;
    }

}