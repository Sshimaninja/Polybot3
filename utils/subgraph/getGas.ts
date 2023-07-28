import { ethers } from "ethers";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const provider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_POLYGON
);

export async function getFee() {
  const gas = await provider.getFeeData()
  console.log(gas);
  return gas;
};
getFee();

export async function polygonGas() {
  try {
    const response = await fetch('https://gasstation.polygon.technology/v2');
    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error(error);
  }
}
polygonGas();

export async function blockGas() {
  // Get the latest block number
  const latestBlockNumber = await provider.getBlockNumber();

  // Get the block with the number one less than the latest block number
  const previousBlock = await provider.getBlock(latestBlockNumber - 1);

  // The gas limit of the previous block is the median gas usage
  const medianGasUsage = previousBlock.gasLimit;

  console.log(previousBlock);
}

blockGas();