type deployedContracts = { [contract: string]: string };

export const deployedMap: deployedContracts = {
	flashDirect: "0x737c5e8d9f4dF9617bac012e892Cb7CcbF25701d",//owner: 0x3018FB91d635D85bFc7590c611dE012db163e8a3
	flashMulti: "0xa754bCc82fea403189b0b3f369100519019f8990",//owner: 0x3018FB91d635D85bFc7590c611dE012db163e8a3
	flashMultiTest: "0xefBa1032bB5f9bEC79e022f52D89C2cc9090D1B8",
	flashDirectTest: "0x86C33a2aF71644c69d1321bcC53AD19b7ab86CcB",
	flashV3: "DEPLOY_ME",
};


// UNISWAP V2:

export type RouterMap = { [protocol: string]: string };

export const uniswapV2Router: RouterMap = {
	// UNI: "0x7a250d5630b4caeaf5c20e6585a6e1ef6c992400",
	SUSHI: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
	QUICK: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
	APE: "0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607",
	JET: "0x5C6EC38fb0e2609672BDf628B1fD605A523E5923",
	POLYDEX: "0xBd13225f0a45BEad8510267B4D6a7c78146Be459",
	// FRAX: "0xE52D0337904D4D0519EF7487e707268E1DB6495F", // FRAX decided to get fancy so I can't use their contracts unless I give them special TLC.
	MMF: "0x51aba405de2b25e5506dea32a6697f450ceb1a17",
	CAT: "0x94930a328162957FF1dd48900aF67B5439336cBD",

	// POLYGON_UNISWAP_V3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
};

export type FactoryMap = { [protocol: string]: string };

export const uniswapV2Factory: FactoryMap = {
	QUICK: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
	SUSHI: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
	APE: "0xCf083Be4164828f00cAE704EC15a36D711491284",
	JET: "0x668ad0ed2622C62E24f0d5ab6B6Ac1b9D2cD4AC7",
	POLYDEX: "0x5BdD1CD910e3307582F213b33699e676E61deaD9",
	// FRAX: "0x54F454D747e037Da288dB568D4121117EAb34e79", // FRAX decided to get fancy so I can't use their contracts unless I give them special TLC.
	MMF: "0x7cFB780010e9C861e03bCbC7AC12E013137D47A5",
	CAT: "0x477Ce834Ae6b7aB003cCe4BC4d8697763FF456FA",
};


// UNISWAP V3:

export const uniswapV3Factory: FactoryMap = {
	UNIV3: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
	// SUSHIV3: "0xaa26771d497814E81D305c511Efbb3ceD90BF5bd"
};

type QuoterMap = { [protocol: string]: string };

export const uniswapQuoter: QuoterMap = {
	UNIV3: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
	// SUSHIV3: "0xb1E835Dc2785b52265711e17fCCb0fd018226a6e",
};

// ALGEBRA: 

//LINKS TO MORE ALGEBRA FACTORY ADDRESSES
//https://docs.algebra.finance/en/docs/contracts/partners/introduction
export const algebraFactory: FactoryMap = {
	QUICKV3: "0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28",
};

export const algebraQuoter: QuoterMap = {
	QUICKV3: "0xa15F0D7377B2A0C0c10db057f641beD21028FC89",
}

export const algebraPoolDeployer: FactoryMap = {
	QUICKV3: "0x2D98E2FA9da15aa6dC9581AB097Ced7af697CB92"
};


// CHAIN IDS:

type ChainIDs = { [chainID: string]: number };

export const chainID: ChainIDs = {
	POLYGON: 137,
}



// GAS TOKENS:

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
