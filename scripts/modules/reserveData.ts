import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPair } from "./smartPair";
import { Reserves } from "./reserves";
export class ReserveData {
    poolID: string;
    reserveIn: BigNumber;
    reserveOut: BigNumber;
    reserveInFormatted: string;
    reserveOutFormatted: string;
    reserveInBN: BN;
    reserveOutBN: BN;
    priceInBN: BN;
    priceOutBN: BN;
    null!: boolean;
    reserves!: Reserves;

    constructor(reserves: [BigNumber, BigNumber], sp: SmartPair, poolID: string) {
        this.poolID = poolID;
        this.reserveIn = reserves[0]
        this.reserveOut = reserves[1]
        this.reserveInFormatted = (utils.formatUnits(this.reserveIn, sp.tokenIndec).toString())
        this.reserveOutFormatted = (utils.formatUnits(this.reserveOut, sp.tokenOutdec).toString())
        this.reserveInBN = new BN(this.reserveInFormatted)
        this.reserveOutBN = new BN(this.reserveOutFormatted)
        this.priceInBN = new BN(this.reserveInFormatted).div(this.reserveOutFormatted)
        this.priceOutBN = new BN(this.reserveOutFormatted).div(this.reserveInFormatted)
    }
}
