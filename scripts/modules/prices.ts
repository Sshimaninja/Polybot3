import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPair } from "./smartPair";
import { SmartPool } from "./smartPool";
import { Reserves } from "./reserves";
import { Pair } from "../../constants/interfaces";


export class Prices {
    pair: Pair | undefined;
    poolID: string | undefined;
    reserveIn: BigNumber | undefined;
    reserveOut: BigNumber | undefined;
    reserveInFormatted: string;
    reserveOutFormatted: string;
    reserveInBN: BN;
    reserveOutBN: BN;
    priceInBN: BN;
    priceOutBN: BN;
    null!: boolean;
    reserves!: Reserves;

    constructor(pair: Pair, poolID: string | undefined, reserves: Reserves | undefined) {
        this.poolID = poolID;
        this.reserveIn = reserves?.reserves.reserveIn;
        this.reserveOut = reserves?.reserves.reserveOut;
        this.reserveInFormatted = (this.reserveIn !== undefined) ? utils.formatUnits(this.reserveIn, pair.token0.decimals).toString() : '';
        this.reserveOutFormatted = (this.reserveOut !== undefined) ? utils.formatUnits(this.reserveOut, pair.token1.decimals).toString() : '';
        this.reserveInBN = new BN(this.reserveInFormatted)
        this.reserveOutBN = new BN(this.reserveOutFormatted)
        this.priceInBN = new BN(this.reserveInFormatted).div(this.reserveOutFormatted)
        this.priceOutBN = new BN(this.reserveOutFormatted).div(this.reserveInFormatted)
    }
}
