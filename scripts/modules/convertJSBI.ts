import JSBI from "jsbi";
import { ethers } from "ethers";

/**
 * Converts ethers.js JSBI.BigInt to JSBI and vice versa.
 */

export const fu = ethers.formatUnits;
export const pu = ethers.parseUnits;

export function numberToJSBI(num: number, decimals: number): JSBI {
    try {
        return JSBI.BigInt((num.toString(), decimals));
    } catch (error: any) {
        console.log("convertJSBI: numberToJSBI: num is undefined");
        return JSBI.BigInt(0);
    }
}
