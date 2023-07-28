import { ethers, Contract } from 'ethers'

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

