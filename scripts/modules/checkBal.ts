import { BigNumber, Contract, ethers } from 'ethers'
import { provider, flashwallet } from '../../constants/contract'
import { deployedMap, /*gasToken,*/ /*uniswapFactory*/ } from '../../constants/addresses'
// import { wallet } from '../deployTest'
// import { Network, Alchemy } from "alchemy-sdk";
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IERC20 } from '@uniswap/v2-periphery/build/IERC20.json';
import { fetchGasPrice } from './fetchGasPrice';
require('dotenv').config()
type gasToken = { [gasToken: string]: string };

export const gasToken: gasToken = {
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    ETH: "0X7CEB23FD6B0DAD790BACD5BCB26288DDB0A9A074",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
}
type FactoryMap = { [protocol: string]: string };

export const uniswapFactory: FactoryMap = {
    SUSHI: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    QUICK: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
};


export async function checkBal(token0: string, token0dec: number, token1: string, token1dec: number) {
    // const token1 = "0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6"

    // const contractbalance = await provider.getBalance(deployedMap.flashTest)

    const erctoken0 = new ethers.Contract(token0, IERC20, provider)
    const erctoken1 = new ethers.Contract(token1, IERC20, provider)
    const wmatictoken = new ethers.Contract(gasToken.WMATIC, IERC20, provider)

    const walletbalance0 = await erctoken0.balanceOf(flashwallet)
    const walletbalance1 = await erctoken1.balanceOf(flashwallet)
    const walletbalanceMatic = await wmatictoken.balanceOf(flashwallet)

    console.log("Wallet: " + flashwallet)
    console.log("Wallet balance token0: " + ethers.utils.formatUnits(walletbalance0, token0dec) + " Asset:  " + token0)
    console.log("Wallet balance token1: " + ethers.utils.formatUnits(walletbalance1, token1dec) + " Asset:  " + token1)
    console.log("Wallet Balance Matic: " + ethers.utils.formatUnits(walletbalanceMatic, 18) + " " + "MATIC")
    // console.log("Block Number: " + (await provider.getBlockNumber()))
    // console.log("Contract balance: " + contractbalance.toString() + " " + deployedMap.flashTest)
}
// checkBal("0x2791bca1f2de4661ed88a30c99a7a9449aa84174", 6, "0x67eb41a14c0fe5cd701fc9d5a3d6597a72f641a6", 18);

export async function checkGasBal(): Promise<BigNumber> {
    const wmatictoken = new ethers.Contract(gasToken.WMATIC, IERC20, provider)
    const walletbalanceMatic: BigNumber = await wmatictoken.balanceOf(flashwallet)
    // console.log("Wallet Balance Matic: " + ethers.utils.formatUnits(walletbalanceMatic, 18) + " " + "MATIC")
    return walletbalanceMatic
}

