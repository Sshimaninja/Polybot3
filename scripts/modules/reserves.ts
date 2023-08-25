import { BigNumber, ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPair } from "./smartPair";
import { Prices } from "./prices";
import { logger } from '../../constants/contract'
import { SmartPool } from "./smartPool";
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { wallet } from '../../constants/contract'


export class Reserves {
    poolID: string | undefined;
    reserves: {
        reserveIn: BigNumber | undefined;
        reserveOut: BigNumber | undefined;
    }
    // lastTrade: BigNumber;
    constructor(poolID: string | undefined) {
        this.poolID = poolID;
        this.reserves = {
            reserveIn: BigNumber.from(0),
            reserveOut: BigNumber.from(0)
        }
    }

    async getReserves(poolID: any): Promise<string[] | undefined> {
        if (this.poolID !== undefined) {
            let Pair = new ethers.Contract(this.poolID, IPair, wallet)
            if (Pair.address != '0x0000000000000000000000000000000000000000') {
                let reserves = await Pair.getReserves().catch((error: any) => {
                    logger.error("Error (getReserves(" + poolID + ")): " + error)
                    logger.error(error)
                    return undefined;
                });
                return reserves;
            } else {
                console.log("Pair" + poolID + " no longer exists!")
            }
        }
    }

}