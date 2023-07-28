import { config as dotEnvConfig } from "dotenv";
import { BigNumber, ethers } from "ethers";
dotEnvConfig();
import * as IUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { getBigNumber } from "../../../tools";
// import { provider } from "../constants/contract";

const provider = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_POLYGON
);

/**
 *
 * @param tokenIn address of token to convert from
 * @param tokenOut address of token to convert to
 * @param amountIn amount of token to convert from
 * @param routerAddress router address
 * @returns
 */
export const V2Reserves = async (
    pairID: string,
) => {
    const V2Pair = new ethers.Contract(
        pairID,
        IUniswapV2Pair.abi,
        provider
    );
    const reserves = await V2Pair.getReserves(pairID);
    if (!reserves) {
        return getBigNumber(0);
    }
    console.log(reserves);
    return reserves[0], reserves[1];
};

