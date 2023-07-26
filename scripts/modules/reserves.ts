import { ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPool } from "./smartPool";
import { ReserveData } from "./reserveData";
import { logger } from '../../constants/contract'

export class Reserves {
    sp: SmartPool;
    reserveData!: Array<ReserveData | null>;

    constructor(sp: SmartPool) {
        this.sp = sp;
    }

    async getReserves(poolNumber: any): Promise<ReserveData | null> {
        if (this.reserveData[poolNumber] === undefined) {
            let exchange = poolNumber ? this.sp.exchangeB : this.sp.exchangeA;
            let Pair = poolNumber ? await this.sp.getPair1() : await this.sp.getPair0();
            if (Pair.ID != '0x0000000000000000000000000000000000000000') {
                this.reserveData[poolNumber] = new ReserveData(
                    await Pair.getReserves().catch((error: any) => {
                        logger.error("Error (getReserves(" + exchange + ")): " + error)
                        logger.error(error)
                    }),
                    this.sp
                );
            } else {
                console.log("Pair" + poolNumber + " " + this.sp.ticker + " no longer exists on " + exchange + "!")
                this.reserveData[poolNumber] = null;
            }
        }
        return this.reserveData[poolNumber];
    }

}
