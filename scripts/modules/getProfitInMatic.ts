import { BigNumber, ethers, utils } from "ethers";
import { BoolTrade } from "../../constants/interfaces";
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { abi as IFactory } from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import { fetchGasPrice } from "./fetchGasPrice";
import { getAmountsIn, getAmountsOut } from "./getAmountsIOjs";
import { gasToken, gasTokens, uniswapV2Factory } from "../../constants/addresses";
import { provider, logger, wallet } from "../../constants/contract";
require("dotenv").config();


export async function getProfitInMatic(trade: BoolTrade): Promise<{ profitInMatic: BigNumber, gasPoolID: string }> {

    const matic = gasTokens.WMATIC;

    try {
        if (trade.tokenOut.id == matic) {
            let profitInMatic = trade.profitJS;
            let gasPoolID = trade.recipient.poolID;
            return { profitInMatic, gasPoolID };
        }
        if (trade.tokenIn.id == matic) {
            let inMatic = await getAmountsOut(trade.profitJS, trade.loanPool.reserveOutjs, trade.loanPool.reserveInjs)
            let profitInMatic = inMatic;
            let gasPoolID = trade.recipient.poolID;
            return { profitInMatic, gasPoolID };
        } else {
            for (const token of Object.keys(gasTokens)) {

                const gasTokenSymbol = await getGasTokenKeyByAddress(gasTokens[token]);

                logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<BEGIN GAS CONVERSION LOOP: ", trade.ticker, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

                logger.info("Pair: ", trade.ticker, " finding profit through ", trade.tokenOut.symbol, "/", gasTokenSymbol, "...")

                const factorya = new ethers.Contract(trade.recipient.factoryID, IFactory, wallet)
                const factoryb = new ethers.Contract(trade.loanPool.factoryID, IFactory, wallet)

                async function getgasPoolID(): Promise<string | undefined> {
                    let gasPoolID = await factorya.getPair(trade.tokenOut.id, gasTokens[token]).catch(async (error: any) => {
                        console.log("Error in factorya.getPair: ", gasPoolID, "\n", error);
                    })

                    if (gasPoolID != BigNumber.from(0).toString()) {
                        return gasPoolID;
                    } else if (gasPoolID == BigNumber.from(0).toString()) {
                        gasPoolID = await factoryb.getPair(trade.tokenOut.id, gasTokens[token]).catch(async (error: any) => {
                            console.log("Error in factoryb.getPair: ", gasPoolID, "\n", error);
                        })
                        if (gasPoolID != BigNumber.from(0).toString()) {
                            return gasPoolID;
                        } else if (gasPoolID == BigNumber.from(0).toString()) {
                            logger.info("No gasPool Found for ", trade.tokenOut.symbol, " ", gasTokenSymbol, ". Attempting intermediary gasToken: ", gasTokenSymbol, "...")
                            return gasPoolID;
                        }
                    }
                    return undefined;
                }

                let gasPoolID = await getgasPoolID()

                if (gasPoolID == undefined) {
                    logger.error("No gasPool Found for ", trade.tokenOut.symbol, " ", gasTokenSymbol, ". Attempting next gasToken")
                    let profitInMatic = BigNumber.from(0);
                    let gasPoolID = BigNumber.from(0).toString();
                    return { profitInMatic, gasPoolID };
                } else {
                    logger.info("gasPoolID: ", gasPoolID)
                    let gasPool = new ethers.Contract(gasPoolID, IPair, provider)

                    //Case: trade.tokenOut.id is paired with WMATIC
                    if (gasPool.token1() == matic) {
                        logger.info("Case 1")
                        const reserves = await gasPool.getReserves();
                        const profitInMatic = await getAmountsOut(trade.profitJS, reserves[0], reserves[1])
                        // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return { profitInMatic, gasPoolID };

                    }
                    //Case: trade.tokenOut.id is paired with a WMATIC, but is in trade.tokenInID position
                    if (gasPool.token0() == matic) {
                        logger.info("Case 2")
                        const reserves = await gasPool.getReserves();
                        const profitInMatic = await getAmountsOut(trade.profitJS, reserves[1], reserves[0]);
                        // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return { profitInMatic, gasPoolID };

                    }
                    //Case: trade.tokenOut.id is paired with a gasToken in the trade.tokenInID position
                    if ((gasPool.token0() && gasPool.token1() != matic) && (gasPool.token0() == trade.tokenOut.id)) {
                        logger.info("Case 3")
                        const reserves = await gasPool.getReserves();
                        const profitInGasToken = await getAmountsOut(trade.profitJS, reserves[0], reserves[1]);//returns profit in gasToken (USDC, WETH, etc.)
                        const gasMaticPool = await (factorya.getPair(gasPool.token1(), matic) ?? factoryb.getPair(gasPool.token1(), matic) ?? undefined);
                        const gasSMaticPoolContract = new ethers.Contract(gasMaticPool, IPair, provider);
                        const profitInMatic = gasSMaticPoolContract.token1() == matic ? await getAmountsOut(trade.profitJS, reserves[0], reserves[1]) : await getAmountsOut(profitInGasToken, reserves[1], reserves[0]);
                        // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return { profitInMatic, gasPoolID };

                    }
                    //Case: trade.tokenOut.id is paired with a gasToken in the trade.match.token1 position
                    if ((gasPool.token0() && gasPool.token1() != matic) && (gasPool.token1() == trade.tokenOut.id)) {
                        logger.info("Case 4")
                        const reserves = await gasPool.getReserves();
                        const profitInGasToken = await getAmountsOut(trade.profitJS, reserves[1], reserves[0]);//returns profit in gasToken (USDC, WETH, etc.)
                        const gasMaticPool = await (factorya.getPair(gasPool.token0(), matic) ?? factoryb.getPair(gasPool.token1(), matic) ?? undefined);
                        const gasSMaticPoolContract = new ethers.Contract(gasMaticPool, IPair, provider);
                        const profitInMatic = gasSMaticPoolContract.token1() === matic ? await getAmountsOut(profitInGasToken, reserves[0], reserves[1]) : await getAmountsOut(profitInGasToken, reserves[1], reserves[0]);
                        // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return { profitInMatic, gasPoolID };

                    }
                }

            }
        }

        logger.info("No gasPool Found for ", trade.ticker, ". Attempting next gasToken")
    } catch (error: any) {
        logger.info("////////////////////////ERROR IN getProfitInMatic////////////////////////")
        logger.info(error);
        let profitInMatic = BigNumber.from(0);
        let gasPoolID = BigNumber.from(0).toString();
        return { profitInMatic, gasPoolID };
    }
    return { profitInMatic: BigNumber.from(0), gasPoolID: BigNumber.from(0).toString() };
}

async function getGasTokenKeyByAddress(address: string): Promise<string | undefined> {
    const gasTokenKeys = Object.keys(gasTokens);
    for (let i = 0; i < gasTokenKeys.length; i++) {
        if (gasTokens[gasTokenKeys[i]] === address) {
            return gasTokenKeys[i];
        }
    }
    return undefined;
}
