import { BigNumber, ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPair } from "./smartPair";
import { Prices } from "./prices";
import { logger } from '../../constants/contract'
import { SmartPool } from "./smartPool";
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { wallet } from '../../constants/contract'
import { ReservesData } from "../../constants/interfaces";
export class Reserves {
    poolID: string;
    reserves: ReservesData | undefined;

    constructor(poolID: string) {
        this.poolID = poolID;
    }

    async getReserves(): Promise<ReservesData | undefined> {
        if (this.poolID !== undefined) {
            let Pair = new ethers.Contract(this.poolID, IPair, wallet)
            if (Pair.address != '0x0000000000000000000000000000000000000000') {
                let reserves = await Pair.getReserves().catch((error: any) => {
                    logger.error("Error (getReserves(" + this.poolID + ")): " + error)
                    logger.error(error)
                    return undefined;
                });
                this.reserves = {
                    reserveIn: reserves[0],
                    reserveOut: reserves[1],
                    blockTimestampLast: reserves[2]
                };
                return this.reserves;
            } else {
                console.log("Pair" + this.poolID + " no longer exists!")
            }
        }
        return undefined;
    }
}
