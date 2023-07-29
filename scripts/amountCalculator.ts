import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPool } from "./modules/smartPool";
import { Reserves } from "./modules/reserves";
import { logger } from '../constants/contract'
import { lowSlippage } from './modules/lowslipBN';
import { ReserveData } from "./modules/reserveData";
import { getAmountsOut, getAmountsIn } from './modules/getAmountsIOjs';
import { HiLo, Difference } from "../constants/interfaces";
import { getDifference, getGreaterLesser, getHiLo } from './modules/getHiLo';

export class AmountCalculator {
    ra: ReserveData;
    rb: ReserveData;
    sp!: SmartPool;
    hilo: HiLo | null = null;
    difference: Difference | null = null;

    amountLowSlippageA: BN | null = null;
    amountLowSlippageB: BN | null = null;

    amountInA: BN | null = null;
    amountInB: BN | null = null;

    amountInTrade!: BN;
    amountIn!: BigNumber;

    amountOutAjs!: BigNumber;
    amountOutBjs!: BigNumber;
    amountRepayAjs!: BigNumber;
    amountRepayBjs!: BigNumber;
    amountOutA!: BN;
    amountOutB!: BN;
    amountRepayA!: BN;
    amountRepayB!: BN;

    constructor(ra: ReserveData, rb: ReserveData) {
        this.ra = ra;
        this.rb = rb;
        console.log(this.ra, this.rb)
        // this.sp = this.ra.reserves.sp;
        return
    }




    async getHilo() {
        if (this.hilo === null) {
            this.hilo = await getHiLo(this.ra.priceOutBN, this.rb.priceOutBN);
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
        if (this.amountInTrade === null) {
            this.amountLowSlippageA = (await lowSlippage(this.ra.reserveInBN, this.ra.reserveOutBN, this.ra.priceOutBN, this.sp.slippageTolerance));
            this.amountLowSlippageB = (await lowSlippage(this.rb.reserveInBN, this.rb.reserveOutBN, this.rb.priceOutBN, this.sp.slippageTolerance));

            this.amountInA = this.amountLowSlippageA//.toFixed(this.sp.tokenIndec);
            this.amountInB = this.amountLowSlippageB//.toFixed(this.sp.tokenIndec);

            this.amountInTrade = BN.min(this.amountInA, this.amountInB)//.toFixed(this.sp.tokenIndec)
        }
        return this.amountInTrade;
    }

    async getAmountIn(): Promise<BigNumber> {
        if (this.amountIn === null) {
            let amountInTrade = await this.getTradeAmount();
            let amountInString = amountInTrade.toFixed(this.sp.tokenIndec);
            this.amountIn = utils.parseUnits(amountInString, this.sp.tokenIndec);
        }
        return this.amountIn;
    }

    async checkLiquidity() {
        let difference = await this.getDifference();
        this.amountOutAjs = getAmountsOut(this.amountIn, this.ra.reserveIn, this.ra.reserveOut)
        this.amountOutBjs = getAmountsOut(this.amountIn, this.rb.reserveIn, this.rb.reserveOut)

        this.amountRepayAjs = getAmountsIn(this.amountIn, this.ra.reserveOut, this.ra.reserveIn)
        this.amountRepayBjs = getAmountsIn(this.amountIn, this.rb.reserveOut, this.rb.reserveIn)

        this.amountOutA = BN(utils.formatUnits(this.amountOutAjs, this.sp.tokenOutdec))
        this.amountOutB = BN(utils.formatUnits(this.amountOutBjs, this.sp.tokenOutdec))

        this.amountRepayA = BN(utils.formatUnits(this.amountRepayAjs, this.sp.tokenOutdec))
        this.amountRepayB = BN(utils.formatUnits(this.amountRepayBjs, this.sp.tokenOutdec))

        return BN(difference.difference).gt(BN(0)) &&
            this.ra.reserveInBN.gt(BN(4)) &&
            this.ra.reserveOutBN.gt(BN(4)) &&
            this.rb.reserveInBN.gt(BN(4)) &&
            this.rb.reserveOutBN.gt(BN(4));

    }

}