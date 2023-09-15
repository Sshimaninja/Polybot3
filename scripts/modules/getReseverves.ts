import { ethers, Contract } from 'ethers'
/**
 * 
 * @param Pair0 
 * @param Pair1 
 * @returns [reserve0: BigNumber, reserve1: BigNumber, isBigNumber:Bool]
 */
export const getReserves = async (Pair0: Contract, Pair1: Contract) => {
    const aReserves = await Pair0.getReserves().catch((error: any) => {
        console.log("Error (getReserves(" + Pair0.address + ")): " + error)
        return aReserves;
    });
    const bReserves = await Pair1.getReserves().catch((error: any) => {
        console.log("Error (getReserves(" + Pair1.address + ")): " + error)
        return bReserves;
    });
    return { aReserves, bReserves };
}

