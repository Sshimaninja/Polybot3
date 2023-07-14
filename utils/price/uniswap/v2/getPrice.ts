import { config as dotEnvConfig } from "dotenv";
import { BigNumber, BigNumberish, ethers } from "ethers";
dotEnvConfig();
import * as UniswapV2Router from "../../../../interfaces/IUniswapV2Router02.json";
import { getBigNumber } from "../../../../utils/tools";
import { provider } from "../../../../constants/contract";
import { abi as QuoterABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
// import { getUniswapV3PoolFee } from "./fee";
dotEnvConfig();
// const provider = new ethers.providers.JsonRpcProvider(
//   "https://rpc.ankr.com/polygon"
// );
// const provider = new ethers.providers.WebSocketProvider(`wss://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_WSS_TOKEN}`);

/**
 *
 * @param tokenIn address of token to convert from
 * @param tokenOut address of token to convert to
 * @param amountIn amount of token to convert from
 * @param routerAddress router address
 * @returns 
 */
export const V2Quote = async ( //how much output per input
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumberish,
  routerAddress: string,
) => {
  const V2Router = new ethers.Contract(
    routerAddress,
    UniswapV2Router.abi,
    provider
  );
  const amountsOut = await V2Router.getAmountsOut(amountIn, [
    tokenIn,
    tokenOut,
  ]);
  if (!amountsOut || amountsOut.length !== 2) {
    return getBigNumber(0);
  }
  return amountsOut[1];
};


////////////////////////////////////////////////////
/**
 * function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) internal pure returns (uint amountIn);
 * @param tokenIn address of token required
 * @param tokenOut address of token to convert from
 * @param amountOut amount of token 
 * @param routerAddress router address
 * @returns 
 */
export const V2Input = async ( //how much input required for output
  tokenIn: string,//token0
  tokenOut: string,//token1
  amountOut: BigNumberish,//should this be borrowed amount token0?
  routerAddress: string,//router for loanPool
) => {
  const V2Router = new ethers.Contract(
    routerAddress,
    UniswapV2Router.abi,
    provider
  );
  const amountsIn = await V2Router.getAmountsIn(amountOut, [
    tokenIn,
    tokenOut,
  ]);
  if (!amountsIn || amountsIn.length !== 2) {
    return getBigNumber(0);
  }
  return amountsIn[0];
};


// https://polygonscan.com/address/0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6
const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const quoterContract = new ethers.Contract(
  quoterAddress,
  QuoterABI,
  provider
);

/**
 *
 * @param tokenIn address of token to convert from
 * @param tokenOut address of token to convert to
 * @param amountIn amount of token to convert from
 * @returns
 */
export const getPriceOnUniV3 = async (
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  fee: number
): Promise<BigNumber> => {
  // const fee = getUniswapV3PoolFee([tokenIn, tokenOut]);
  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    tokenIn,
    tokenOut,
    fee,
    amountIn.toString(),
    0
  );
  if (!ethers.BigNumber.isBigNumber(quotedAmountOut)) {
    return getBigNumber(0);
  }
  return quotedAmountOut;
};
