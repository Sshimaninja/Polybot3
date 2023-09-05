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
    tradeSize!: BigNumber

    amountOutJS!: BigNumber;
    amountRepayJS!: BigNumber;
    amountOutBN!: BN;
    amountRepayBN!: BN;

    constructor(price: Prices, pair: Pair, slippageTolerance: BN) {
        this.reserves = price.reserves;
        this.pair = pair;
        this.price = price;
        this.slip = slippageTolerance
        this.token0 = pair.token0;
        this.token1 = pair.token1;
        this.amountLowSlippage = BN(0);
        this.tradeSizeBN = BN(0);
    }

    async getTradeAmountBN(): Promise<BN> {
        if (this.tradeSizeBN !== null) {
            this.amountLowSlippage = await lowSlippage(this.price.reserves.reserveInBN, this.price.reserves.reserveOutBN, this.price.priceOutBN, this.slip);
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

    async getAmounts(): Promise<Amounts> {

        let tradeSize = await this.getTradeAmount();

        this.amountOutJS = await getAmountsOut(tradeSize, this.price.reserves.reserveIn, this.price.reserves.reserveOut!)

        this.amountRepayJS = await getAmountsIn(tradeSize, this.price.reserves.reserveOut, this.price.reserves.reserveIn!)

        this.amountOutBN = BN(utils.formatUnits(this.amountOutJS, this.token1?.decimals!))

        this.amountRepayBN = BN(utils.formatUnits(this.amountRepayJS, this.token1?.decimals!))

        let amounts: Amounts = {
            tradeSize: tradeSize,
            amountOutBN: this.amountOutBN,
            amountOutJS: this.amountOutJS,
            amountRepayBN: this.amountRepayBN,
            amountRepayJS: this.amountRepayJS,
        }
        return amounts;

    }

}