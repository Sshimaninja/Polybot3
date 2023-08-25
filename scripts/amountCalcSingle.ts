import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
// import { Reserves } from "./modules/reserves";
import { logger } from '../constants/contract'
import { lowSlippage } from './modules/lowslipBN';
// import { ReserveData } from "./modules/reserveData";
import { Pair } from "../constants/interfaces";
import { Reserves } from "./modules/reserves";
import { Prices } from "./modules/prices";
import { getAmountsOut, getAmountsIn } from './modules/getAmountsIOjs';
import { HiLo, Difference } from "../constants/interfaces";
import { getDifference, getGreaterLesser, getHiLo } from './modules/getHiLo';

export class AmountCalculator {
    pair: Pair | undefined;
    price: Prices | undefined;
    reserves: BigNumber | undefined;
    hilo: HiLo | null = null;
    difference: Difference | null = null;
    slip: BN | undefined;
    amountLowSlippage: BN | null = null;

    tradeSizeBN!: BN
    tradeSizeJS!: BigNumber


    amountOutJS!: BigNumber;
    amountRepayJS!: BigNumber;
    amountOutBN!: BN;
    amountRepayBN!: BN;

    constructor(price: Prices, pair: Pair, slippageTolerance: BN) {
        this.pair = pair;
        this.price = price;
        this.slip = slippageTolerance;
    }

    async getHilo() {
        if (this.hilo === null) {
            this.hilo = await getHiLo(this.price!.priceOutBN, this.price!.priceOutBN);
        }
        return this.hilo;
    }

    async getDifference() {
        if (this.difference === null) {
            let hilo = await this.getHilo();
            this.difference = await getDifference(hilo.higher, hilo.lower)
        }
        return this.difference;
    }

    async getTradeAmount(): Promise<BN> {
        if (this.tradeSizeBN === null) {
            this.amountLowSlippage = (
                await lowSlippage(
                    this.price!.reserveInBN, this.price!.reserveOutBN, this.price!.priceOutBN, this.slip!));

            this.tradeSizeBN = this.amountLowSlippage//.toFixed(this.sp.tokenIndec);

            // this.tradeSize = BN.min(this.amountIn, this.amountInB)//.toFixed(this.sp.tokenIndec)
        }
        return this.tradeSizeBN;
    }

    async getAmountIn(): Promise<BigNumber> {
        if (this.tradeSizeBN === null) {
            let tradeSizeJS = await this.getTradeAmount();
            let amountInString = tradeSizeJS.toFixed(this.pair?.token0.decimals!);
            this.amountRepayJS = utils.parseUnits(amountInString, this.pair?.token0.decimals!);
        }
        return this.amountRepayJS;
    }

    async checkLiquidity() {
        let difference = await this.getDifference();
        this.amountOutJS = getAmountsOut(this.tradeSizeJS, this.price?.reserveIn!, this.price?.reserveOut!)

        this.amountRepayJS = getAmountsIn(this.tradeSizeJS, this.price?.reserveOut!, this.price?.reserveIn!)

        this.amountOutBN = BN(utils.formatUnits(this.amountOutJS, this.pair?.token1.decimals!))

        this.amountRepayBN = BN(utils.formatUnits(this.amountRepayJS, this.pair?.token0.decimals!))

        return BN(difference.difference).gt(BN(0)) &&
            this.price!.reserveInBN.gt(BN(4)) &&
            this.price!.reserveOutBN.gt(BN(4)) &&
            this.price!.reserveInBN.gt(BN(4)) &&
            this.price!.reserveOutBN.gt(BN(4));

    }

}