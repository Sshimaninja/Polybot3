import { BigNumber, utils } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Reserves } from "./reserves";
import { Pair, ReservesData } from "../../constants/interfaces";
import { Token } from "../../constants/interfaces";


export class Prices {
    poolID: string;
    priceInBN: BN;
    priceOutBN: BN;
    reserves: ReservesData;

    constructor(token0: Token, token1: Token, poolID: string, reserves: ReservesData) {
        this.poolID = poolID;
        this.reserves = reserves;
        reserves.reserveIn = reserves.reserveIn;
        reserves.reserveOut = reserves.reserveOut;
        this.priceInBN = reserves.reserveInBN.div(reserves.reserveOutBN);
        this.priceOutBN = reserves.reserveOutBN.div(reserves.reserveInBN);
    }
}