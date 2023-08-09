import { ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPair } from "./smartPair";
import { ReserveData } from "./reserveData";
import { logger } from '../../constants/contract'


export class Reserves {
    sp: SmartPair;
    reserveData!: Array<ReserveData>

    constructor(sp: SmartPair) {
        this.sp = sp;
    }

    async getReserves(poolID: any): Promise<ReserveData | null> {
        if (this.reserveData[poolID] === undefined) {
            let exchange = poolID ? this.sp.exchangeB : this.sp.exchangeA;
            let Pair = poolID ? await this.sp.getPair1() : await this.sp.getPair0();
            if (Pair.ID != '0x0000000000000000000000000000000000000000') {
                this.reserveData[poolID] = new ReserveData(
                    await Pair.getReserves().catch((error: any) => {
                        logger.error("Error (getReserves(" + exchange + ")): " + error)
                        logger.error(error)
                    }),
                    poolID,
                    this.sp.
                );
            } else {
                console.log("Pair" + poolID + " " + this.sp.ticker + " no longer exists on " + exchange + "!")
                // this.reserveData[poolID] = null;
            }
        }
        return this.reserveData[poolID];
    }

}