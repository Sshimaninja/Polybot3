import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { SmartPair } from "./smartPair";
import { SmartPool } from "./smartPool";
import { Reserves } from "./reserves";
import { Pair, ReservesData } from "../../constants/interfaces";
import { Token } from "../../constants/interfaces";


export class Prices {
    pair: Pair | undefined;
    token0: Token | undefined;
    token1: Token | undefined;
    poolID: string | undefined;
    reserveIn!: BigNumber;
    reserveOut!: BigNumber;
    reserveInFormatted: string;
    reserveOutFormatted: string;
    reserveInBN: BN;
    reserveOutBN: BN;
    priceInBN: BN;
    priceOutBN: BN;
    null!: boolean;
    reserves!: ReservesData | undefined;


    constructor(token0: Token, token1: Token, poolID: string | undefined, reserves: ReservesData | undefined) {
        // console.log('reserves:', reserves);
        if (reserves === undefined) {
            this.reserveInFormatted = '';
            this.reserveOutFormatted = '';
            this.reserveInBN = new BN(0);
            this.reserveOutBN = new BN(0);
            this.priceInBN = new BN(0);
            this.priceOutBN = new BN(0);
        } else {
            this.poolID = poolID;
            this.token0 = token0;
            this.token1 = token1;
            this.reserveIn = reserves.reserveIn
            this.reserveOut = reserves.reserveOut
            this.reserveInFormatted = (this.reserveIn !== undefined) ? utils.formatUnits(this.reserveIn, token0?.decimals).toString() : '';
            this.reserveOutFormatted = (this.reserveOut !== undefined) ? utils.formatUnits(this.reserveOut, token1?.decimals).toString() : '';
            this.reserveInBN = new BN(this.reserveInFormatted)
            this.reserveOutBN = new BN(this.reserveOutFormatted)
            this.priceInBN = new BN(this.reserveInFormatted).div(this.reserveOutFormatted)
            this.priceOutBN = new BN(this.reserveOutFormatted).div(this.reserveInFormatted)
        }
    }




}
