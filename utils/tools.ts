import { ethers } from "hardhat";
import { uniswapRouter } from "../constants/addresses";;



export const deployContractFromName = async (
  contractName: string,
  factoryType: any,
  args: Array<any> = []
) => {
  const factory = (await ethers.getContractFactory(
    contractName
  )) as typeof factoryType;
  return factory.deploy(...args);
};

export const getBigNumber = (amount: number, decimals = 18) => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
};

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const preventUnderflow = (amount: number, decimals: number): string => {
  if (amount.toString().length > decimals) {
    return amount.toFixed(decimals).toString();
  }
  return amount.toString();
};

export const replaceTokenAddress = (
  token: string,
  address: string,
  newAddress: string
) => {
  return token === address ? newAddress : token;
};

export const findRouter = (router: string) => {
  for (let k of Object.keys(uniswapRouter)) {
    if (router.toLowerCase() === uniswapRouter[k].toLowerCase()) {
      return k;
    }
  }
  return "UNKNOWN";
};

/**
 *
 * @param token address
 * @returns token symbol
 */


/**
 * @param protocol
 * @returns router address
 */
export const findRouterFromProtocol = (protocol: number) => {
  return uniswapRouter[Object.keys(uniswapRouter)[protocol]];
};

