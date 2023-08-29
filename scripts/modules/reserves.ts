import { BigNumber, ethers, utils, } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Prices } from "./prices";
import { logger } from '../../constants/contract'
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { wallet } from '../../constants/contract'
import { ReservesData, Pair } from "../../constants/interfaces";
export class Reserves {
    static reserves: ReservesData[] = [];

    constructor(match: Pair) {
        this.getReserves(match)
    }

    async getPoolIDs(pair: Pair): Promise<string[]> {
        const poolIDs: string[] = [];
        for (const key in pair) {
            if (key.startsWith("pool")) {
                const poolID = pair[key as keyof Pair];
                if (typeof poolID === "string") {
                    poolIDs.push(poolID);
                }
            }
        }
        return poolIDs;
    }
    async getReserves(match: Pair): Promise<ReservesData[]> {
        const poolIDs = await this.getPoolIDs(match);
        const reserves: ReservesData[] = [];
        for (const poolID of poolIDs) {
            let Pair = new ethers.Contract(poolID, IPair, wallet)
            if (Pair.address != '0x0000000000000000000000000000000000000000') {
                let reservesData = await Pair.getReserves().catch((error: any) => {
                    logger.error("Error (getReserves(" + poolID + ")): " + error)
                    logger.error(error)
                    return undefined;
                });
                if (reservesData !== undefined) {
                    const [reserveIn, reserveOut, blockTimestampLast] = reservesData;
                    const reserveInBN = BN(utils.formatUnits(reserveIn, match.token0.decimals));
                    const reserveOutBN = BN((utils.formatUnits(reserveOut, match.token1.decimals)));
                    const reserveData: ReservesData = {
                        reserveIn,
                        reserveOut,
                        reserveInBN,
                        reserveOutBN,
                        blockTimestampLast
                    };
                    reserves.push(reserveData);
                }
            } else {
                console.log("Pair" + poolID + " no longer exists!")
            }
        }
        return reserves;
    }

}
