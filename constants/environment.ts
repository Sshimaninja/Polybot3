import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";
import { abi as IERC20 } from "@openzeppelin/contracts/build/contracts/IERC20.json";
// import { abi as ISwap } from "../artifacts/contracts/v2/swap.sol/Swap.json";
//import { abi as IFlashMulti } from "../artifacts/contracts/v2/flashMulti.sol/flashMulti.json";
import { abi as IFlashUniV3Multi } from "../artifacts/contracts/v3/UniswapV3SingleFlashMulti.sol/PairFlash.json";
//import { abi as IFlashUniV3Direct } from "../artifacts/contracts/v3/uniswapV3DoubleFlashDirect.sol/PairFlash.json";
// import { abi as IFlashSingle } from "../artifacts/contracts/v2/flashSingleTest.sol/flashSingleTest.json";
import { provider, wallet, signer } from "./provider";
import { BigNumber as BN } from "bignumber.js";
import { logger } from "./logger";
export const dotenv = dotenvConfig({
	path: `.env.${process.env.NODE_ENV == "test" ? "test" : "live"}`,
});

export let slip = BN(0.006);

if (
	process.env.FLASH_MULTI === undefined ||
	process.env.FLASH_SINGLE === undefined ||
	process.env.SWAP_SINGLE === undefined ||
	process.env.SWAP_MULTI === undefined
) {
	logger.error("No contract address set in .env file");
	throw new Error("No contract address set in .env file");
}
export const zero: string = "0x0000000000000000000000000000000000000000";
export const MATIC = new ethers.Contract(
	"0x0000000000000000000000000000000000001010",
	IERC20,
	provider,
);
export const dai = new ethers.Contract(
	"0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
	IERC20,
	provider,
);
export const wmatic = new ethers.Contract(
	"0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
	IERC20,
	provider,
);
export const usdc = new ethers.Contract(
	"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
	IERC20,
	provider,
);
export const usdt = new ethers.Contract(
	"0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
	IERC20,
	provider,
);
export const swapID = process.env.SWAP_SINGLE;
export const flashMultiID = process.env.FLASH_MULTI;
export const flashSingleID = process.env.FLASH_SINGLE;



// export const swap = new ethers.Contract(swapID, ISwap, signer);
export const flashV3Multi = new ethers.Contract(
	flashMultiID,
	IFlashUniV3Multi,
	signer,
);
// export const flashSingle = new ethers.Contract(
//     flashSingleID,
//     IFlashSingle,
//     signer,
// );
