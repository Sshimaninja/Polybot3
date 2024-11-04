//import { ethers } from "ethers";
//import { abi as IERC20 } from "@uniswap/v2-periphery/build/IERC20.json";
//import { provider, signer } from "../../../../constants/provider";
//import JSBI from "jsbi";//import { Bool3Trade } from "../../../../constants/interfaces";
//import { BigInt2JSBI } from "../../../modules/convertJSBI";

//export async function getFunds(trade: Bool3Trade): Promise<walletSizes> {
//    const tokenInContract = new ethers.Contract(
//        trade.tokenIn.id,
//        IERC20,
//        provider,
//    );
//    const balance0 = trade.wallet.tokenInBalance;
//    const balance1 = trade.wallet.tokenOutBalance;
//    const balance0JSBI = BigInt2JSBI(balance0, trade.tokenIn.decimals);
//    const balance1JSBI = BigInt2JSBI(balance1, trade.tokenOut.decimals);
//    let size: walletSizes = {
//        tokenIn: { size: balance0, sizeJSBI: balance0JSBI },
//        tokenOut: { size: balance1, sizeJSBI: balance1JSBI },
//    };
//    return size;
//}
