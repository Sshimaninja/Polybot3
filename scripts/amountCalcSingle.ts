import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPair } from "./modules/smartPair";
import { Reserves } from "./modules/reserves";
import { logger } from '../constants/contract'
import { lowSlippage } from './modules/lowslipBN';
import { ReserveData } from "./modules/reserveData";
import { getAmountsOut, getAmountsIn } from './modules/getAmountsIOjs';
import { HiLo, Difference } from "../constants/interfaces";
import { getDifference, getGreaterLesser, getHiLo } from './modules/getHiLo';
import { SmartPool } from "./modules/smartPool";

export class AmountCalculator {
    r: ReserveData;
    sp!: SmartPool;

    amountLowSlippage: BN | null = null;

    amountIn: BN | null = null;
    tradeSize!: BN;
    tradeSizejs!: BigNumber;

    amountOutjs!: BigNumber;
    amountRepayjs!: BigNumber;
    amountOut!: BN;
    amountRepay!: BN;

    constructor(r: ReserveData) {
        this.r = r;
        // console.log(this.ra, this.rb)
        // this.sp = this.ra.reserves.sp;
        // return
    }

    // async getHilo() {
    //     if (this.hilo === null) {
    //         this.hilo = await getHiLo(this.ra.priceOutBN, this.rb.priceOutBN);
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

    async getTradeAmount(): Promise<BN> {
        if (this.tradeSize === null) {
            this.amountLowSlippage = (await lowSlippage(this.r.reserveInBN, this.r.reserveOutBN, this.r.priceOutBN, this.sp.slippageTolerance));
            this.tradeSize = this.amountLowSlippage//.toFixed(this.sp.tokenIndec);
        }
        return this.tradeSize;
    }

    async getTradeAmountjs(): Promise<BigNumber> {
        if (this.tradeSizejs === null) {
            let amountIn = await this.getTradeAmount();
            let amountInString = amountIn.toFixed(this.sp.tokenIndec);
            this.tradeSizejs = utils.parseUnits(amountInString, this.sp.tokenIndec);
        }
        return this.tradeSizejs;
    }

    async checkLiquidity() {
        // let difference = await this.getDifference();
        this.amountOutjs = getAmountsOut(this.tradeSizejs, this.r.reserveIn, this.r.reserveOut)

        this.amountRepayjs = getAmountsIn(this.tradeSizejs, this.r.reserveOut, this.r.reserveIn)

        this.amountOut = BN(utils.formatUnits(this.amountOutjs, this.sp.tokenOutdec))

        this.amountRepay = BN(utils.formatUnits(this.amountRepayjs, this.sp.tokenOutdec))

        return this.r.reserveInBN.gt(BN(1)) && this.r.reserveOutBN.gt(BN(1));
    }
}