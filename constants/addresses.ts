type deployedContracts = { [contract: string]: string };

export const deployedMap: deployedContracts = {
  // flashA: "DEPLOY_ME",
  // flashB: "DEPLOY_ME",
  // flashOne: "0xf4059341491E0Ec3FE6003708d2F6F9dB0fC7c4a",
  // flashOne: "0x285aD7932ABCAfBDC622e6D0b5AfB3B15176Cca3",
  flashit: "0xbd069c51f511c79f43206456c30177759d7bb070",
  //flashi(old addresses): 0x3fe5a13902b174C28cB7B2841EF8F35fC8F68150
  // flashTest: "0x65e001b67f1ad28ff337c4f6e1ca52f31f5eb9fd"
};
type QuoterMap = { [protocol: string]: string };

export const uniswapQuoter: QuoterMap = {
  UNI: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  SUSHI: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  QUICK: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
};

type RouterMap = { [protocol: string]: string };

export const uniswapRouter: RouterMap = {
  UNI: "0x7a250d5630b4caeaf5c20e6585a6e1ef6c992400",
  SUSHI: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  QUICK: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
};

type FactoryMap = { [protocol: string]: string };

export const uniswapFactory: FactoryMap = {
  UNI: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  SUSHI: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  QUICK: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
};

type ChainIDs = { [chainID: string]: number };

export const chainID: ChainIDs = {
  POLYGON: 137,
}

type gasToken = { [gasToken: string]: string };

export const gasToken: gasToken = {
  WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  ETH: "0X7CEB23FD6B0DAD790BACD5BCB26288DDB0A9A074",
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
}

