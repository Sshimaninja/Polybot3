import { BigNumber, ethers, Contract } from "ethers";
import { wallet } from "../../constants/contract";
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { logger } from "../../constants/contract";
import { GasToken, gasTokens, uniswapV2Factory } from "../../constants/addresses";
import { BoolTrade } from "../../constants/interfaces";
require("dotenv").config();
/**
 * Gets the gastoken/tradetoken address for a given trade, if WMATIC is not in the traded pool.
 * @param trade 
 * @returns gasPool contract and symbol.
 */

export async function getgasPoolForTrade(trade: BoolTrade): Promise<{ gasPool: Contract, gasTokenSymbol: string } | undefined> {

    const gasTokenAddresses = Object.values(gasTokens);

    for (const token in gasTokenAddresses) {

        try {
            // console.log(gasTokenAddresses[address])
            const address = gasTokenAddresses[token];
            const gasTokenSymbol = await getGasTokenKeyByAddress(address);
            console.log('Trying token ' + gasTokenSymbol + '...')

            if (gasTokenSymbol) {

                let gasPoolID = await trade.recipient.factory.getPair(trade.tokenOut.id, address).catch(async (error: any) => {
                    logger.error("Error in getgasPoolForTrade: ", gasPoolID, "\n", error);
                })

                if (gasPoolID !== BigNumber.from(0).toString()) {
                    console.log("GasPool found for: ", trade.tokenOut.symbol, " ", gasTokenSymbol)
                    const gasPool = new ethers.Contract(gasPoolID, IPair, wallet);
                    return {
                        gasPool, gasTokenSymbol
                    };
                }

                gasPoolID = await trade.loanPool.factory.getPair(trade.tokenOut.id, address).catch(async (error: any) => {
                    logger.error("Error in getgasPoolForTrade: ", gasPoolID, "\n", error);
                })

                if (gasPoolID !== BigNumber.from(0).toString()) {
                    console.log("GasPool found for: ", trade.tokenOut.symbol, " ", gasTokenSymbol)
                    const gasPool = new ethers.Contract(gasPoolID, IPair, wallet);
                    return {
                        gasPool, gasTokenSymbol
                    };
                } else {
                    logger.info("No gasPool Found for ", trade.tokenOut.symbol, " ", gasTokenSymbol, ". Attempting another intermediary gasToken: ", gasTokenSymbol, "...");
                }

            }

        } catch (error) {
            console.log(`Error in getgasPoolForTrade: ${error}`);
        }

    }

    return undefined;

}

export async function getGasTokenKeyByAddress(address: string): Promise<string | undefined> {
    const gasTokenKeys = Object.keys(gasTokens);
    for (let i = 0; i < gasTokenKeys.length; i++) {
        if (gasTokens[gasTokenKeys[i]] === address) {
            console.log("GasToken Key: ", gasTokenKeys[i])
            return gasTokenKeys[i];
        }
    }
    return undefined;
}

