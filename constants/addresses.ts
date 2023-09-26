type deployedContracts = { [contract: string]: string };

export const deployedMap: deployedContracts = {
  flashDirect: "0x9173d28636E7B3e3a12bc87AC01c8f0aa1F32e75",
  flashMulti: "0x1a325c827e84568fb80CB94AFF4d1Be55050Bf89",
  flashV3: "DEPLOY_ME",
  // flashB: "DEPLOY_ME",
  // flashOne: "0xf4059341491E0Ec3FE6003708d2F6F9dB0fC7c4a",
  // flashOne: "0x285aD7932ABCAfBDC622e6D0b5AfB3B15176Cca3",
  // flashit: "0xbd069c51f511c79f43206456c30177759d7bb070",
  //flashi(old addresses): 0x3fe5a13902b174C28cB7B2841EF8F35fC8F68150
  // flashTest: "0x65e001b67f1ad28ff337c4f6e1ca52f31f5eb9fd"
};
type QuoterMap = { [protocol: string]: string };

export const uniswapQuoter: QuoterMap = {
  UNI: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
  SUSHI: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  QUICK: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
  QUICKV3: "0xa15F0D7377B2A0C0c10db057f641beD21028FC89",
};

export type RouterMap = { [protocol: string]: string };

export const uniswapV2Router: RouterMap = {
  // UNI: "0x7a250d5630b4caeaf5c20e6585a6e1ef6c992400",
  SUSHI: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  QUICK: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
  APE: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
  JET: "0x5C6EC38fb0e2609672BDf628B1fD605A523E5923",
  // POLYGON_UNISWAP_V3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
};

export type FactoryMap = { [protocol: string]: string };

export const uniswapV2Factory: FactoryMap = {
  QUICK: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
  SUSHI: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  APE: "0xCf083Be4164828f00cAE704EC15a36D711491284",
  JET: "0x668ad0ed2622C62E24f0d5ab6B6Ac1b9D2cD4AC7",
};

export const uniswapV3Factory: FactoryMap = {
  UNI: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  QUICK: "0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28",
};


type ChainIDs = { [chainID: string]: number };

export const chainID: ChainIDs = {
  POLYGON: 137,
}

export type GasToken = { [gasToken: string]: string };

export const gasTokens: GasToken = {
  WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  ETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  WETH: "0x95D7632E9f183b47FCe7BD3518bDBf3E35e25eEF",
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
}
