import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
// import { Reserves } from "./modules/reserves";
import { logger } from '../constants/contract'
import { lowSlippage } from './modules/lowslipBN';
// import { ReserveData } from "./modules/reserveData";
import { Pair } from "../constants/interfaces";
import { Reserves } from "./modules/reserves";
import { Prices } from "./modules/prices";
import { Token } from "../constants/interfaces";
import { getAmountsOut, getAmountsIn } from './modules/getAmountsIOjs';
import { HiLo, Difference } from "../constants/interfaces";
import { getDifference, getGreaterLesser, getHiLo } from './modules/getHiLo';

export class AmountCalculator {
    exchange: string | undefined;
    pair: Pair | undefined;
    token0: Token | undefined;
    token1: Token | undefined;
    price: Prices | undefined;
    reserves: BigNumber | undefined;
    hilo: HiLo | null = null;
    difference: Difference | null = null;
    slip: BN | undefined;
    amountLowSlippage: BN | null = null;

    tradeSizeBN!: BN
    tradeSize!: BigNumber

    amountOutJS!: BigNumber;
    amountRepayJS!: BigNumber;
    amountOutBN!: BN;
    amountRepayBN!: BN;

    constructor(price: Prices, pair: Pair, slippageTolerance: BN) {
        this.pair = pair;
        this.token0 = pair.token0;
        this.token1 = pair.token1;
        this.price = price;
        this.slip = slippageTolerance;
    }

    // async getHilo() {
    //     if (this.hilo === null) {
    //         this.hilo = await getHiLo(this.price!.priceOutBN, this.price!.priceOutBN);
    //     }
    //     return this.hilo;
    // }

    // async getDifference() {
    //     if (this.difference === null) {
    //         let hilo = await this.getHilo();
    //         this.difference = await getDifference(hilo.higher, hilo.lower)
    //     }
    //     return this.difference;
    // }

    async getTradeAmountBN(): Promise<BN> {
        if (this.tradeSizeBN !== null) {
            this.amountLowSlippage = (
                await lowSlippage(
                    this.price!.reserveInBN, this.price!.reserveOutBN, this.price!.priceOutBN, this.slip!));
            this.tradeSizeBN = this.amountLowSlippage//.toFixed(this.sp.tokenIndec);
            // this.tradeSize = BN.min(this.amountIn, this.amountInB)//.toFixed(this.sp.tokenIndec)
        }
        // console.log("tradeSizeBN: ", this.tradeSizeBN)
        return this.tradeSizeBN;
    }

    async getTradeAmount(): Promise<BigNumber> {
        if (this.tradeSizeBN !== null) {
            let tradeSizeBN = await this.getTradeAmountBN();
            let tradeSizeNumber = tradeSizeBN.toFixed(this.token0?.decimals!);
            this.tradeSize = utils.parseUnits(tradeSizeNumber, this.token0?.decimals!);
        }
        return this.tradeSize;
    }

    async getAmounts() {

        let tradeSize = await this.getTradeAmount();

        this.amountOutJS = getAmountsOut(tradeSize, this.price?.reserveIn!, this.price?.reserveOut!)

        this.amountRepayJS = getAmountsIn(tradeSize, this.price?.reserveOut!, this.price?.reserveIn!)

        this.amountOutBN = BN(utils.formatUnits(this.amountOutJS, this.token1?.decimals!))

        this.amountRepayBN = BN(utils.formatUnits(this.amountRepayJS, this.token0?.decimals!))

        return {
            amountOutJS: this.amountOutJS,
            amountRepayJS: this.amountRepayJS,
            amountOutBN: this.amountOutBN,
            amountRepayBN: this.amountRepayBN
        }

    }

}