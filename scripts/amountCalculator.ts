// import { BigNumber, utils } from "ethers";
// import { BigNumber as BN } from "bignumber.js";
// // import { Reserves } from "./modules/reserves";
// import { logger } from '../constants/contract'
// import { lowSlippage } from './modules/lowslipBN';
// // import { ReserveData } from "./modules/reserveData";
// import { Pair } from "../constants/interfaces";
// import { Reserves } from "./modules/reserves";
// import { Prices } from "./modules/prices";
// import { getAmountsOut, getAmountsIn } from './modules/getAmountsIOjs';
// import { HiLo, Difference } from "../constants/interfaces";
// import { getDifference, getGreaterLesser, getHiLo } from './modules/getHiLo';

// export class AmountCalculator {
//     pair: Pair[] | undefined;
//     price: Prices | undefined;
//     ra: BigNumber | undefined;
//     rb: BigNumber | undefined;
//     hilo: HiLo | null = null;
//     difference: Difference | null = null;

//     amountLowSlippageA: BN | null = null;
//     amountLowSlippageB: BN | null = null;

//     amountInA: BN | null = null;
//     amountInB: BN | null = null;

//     amountInTrade!: BN;
//     amountIn!: BigNumber;

//     amountOutAjs!: BigNumber;
//     amountOutBjs!: BigNumber;
//     amountRepayAjs!: BigNumber;
//     amountRepayBjs!: BigNumber;
//     amountOutA!: BN;
//     amountOutB!: BN;
//     amountRepayA!: BN;
//     amountRepayB!: BN;

//     constructor(price: Prices, slippageTolerance: BN) {
//         this.price = price;
//         // console.log(this.price!, this.price!)
//         // this.sp = this.price!.reserves.sp;
//         // return
//     }

//     async getHilo() {
//         if (this.hilo === null) {
//             this.hilo = await getHiLo(this.price!.priceOutBN, this.price!.priceOutBN);
//         }
//         return this.hilo;
//     }

//     async getDifference() {
//         if (this.difference === null) {
//             let hilo = await this.getHilo();
//             this.difference = await getDifference(hilo.higher, hilo.lower)
//         }
//         return this.difference;
//     }

//     async getTradeAmount(): Promise<BN> {
//         if (this.amountInTrade === null) {
//             this.amountLowSlippageA = (await lowSlippage(this.price!.reserveInBN, this.price!.reserveOutBN, this.price!.priceOutBN, this.sp.slippageTolerance));
//             this.amountLowSlippageB = (await lowSlippage(this.price!.reserveInBN, this.price!.reserveOutBN, this.price!.priceOutBN, this.sp.slippageTolerance));

//             this.amountInA = this.amountLowSlippageA//.toFixed(this.sp.tokenIndec);
//             this.amountInB = this.amountLowSlippageB//.toFixed(this.sp.tokenIndec);

//             this.amountInTrade = BN.min(this.amountInA, this.amountInB)//.toFixed(this.sp.tokenIndec)
//         }
//         return this.amountInTrade;
//     }

//     async getAmountIn(): Promise<BigNumber> {
//         if (this.amountIn === null) {
//             let amountInTrade = await this.getTradeAmount();
//             let amountInString = amountInTrade.toFixed(this.sp.tokenIndec);
//             this.amountIn = utils.parseUnits(amountInString, this.sp.tokenIndec);
//         }
//         return this.amountIn;
//     }

//     async checkLiquidity() {
//         let difference = await this.getDifference();
//         this.amountOutAjs = getAmountsOut(this.amountIn, this.price!.reserveIn, this.price!.reserveOut)
//         this.amountOutBjs = getAmountsOut(this.amountIn, this.price!.reserveIn, this.price!.reserveOut)

//         this.amountRepayAjs = getAmountsIn(this.amountIn, this.price!.reserveOut, this.price!.reserveIn)
//         this.amountRepayBjs = getAmountsIn(this.amountIn, this.price!.reserveOut, this.price!.reserveIn)

//         this.amountOutA = BN(utils.formatUnits(this.amountOutAjs, this.sp.tokenOutdec))
//         this.amountOutB = BN(utils.formatUnits(this.amountOutBjs, this.sp.tokenOutdec))

//         this.amountRepayA = BN(utils.formatUnits(this.amountRepayAjs, this.sp.tokenOutdec))
//         this.amountRepayB = BN(utils.formatUnits(this.amountRepayBjs, this.sp.tokenOutdec))

//         return BN(difference.difference).gt(BN(0)) &&
//             this.price!.reserveInBN.gt(BN(4)) &&
//             this.price!.reserveOutBN.gt(BN(4)) &&
//             this.price!.reserveInBN.gt(BN(4)) &&
//             this.price!.reserveOutBN.gt(BN(4));

//     }

// }