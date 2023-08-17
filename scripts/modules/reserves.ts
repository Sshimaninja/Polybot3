import { ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPair } from "./smartPair";
import { ReserveData } from "./reserveData";
import { logger } from '../../constants/contract'
import { SmartPool } from "./smartPool";


export class Reserves {
    sp: SmartPool;
    reserveData!: Array<ReserveData>

    constructor(sp: SmartPool) {
        this.sp = sp;
    }

    async getReserves(poolID: any): Promise<ReserveData | null> {
        if (this.reserveData[poolID] !== undefined) {
            let exchange = this.sp.exchange
            let Pair = await this.sp.poolContract()
            if (Pair.address != '0x0000000000000000000000000000000000000000') {
                this.reserveData[poolID] = new ReserveData(
                    await Pair.getReserves().catch((error: any) => {
                        logger.error("Error (getReserves(" + exchange + ")): " + error)
                        logger.error(error)
                    }),
                    this.sp,
                    poolID,
                );
            } else {
                console.log("Pair" + poolID + " " + this.sp.ticker + " no longer exists on " + exchange + "!")
                // this.reserveData[poolID] = null;
            }
        }
        return this.reserveData[poolID];
    }

}