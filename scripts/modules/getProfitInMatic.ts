import { BigNumber, ethers, Contract } from "ethers";
import { BoolTrade } from "../../constants/interfaces";
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { getAmountsOut } from "./getAmountsIOjs";
import { gasTokens } from "../../constants/addresses";
import { provider, logger, wallet } from "../../constants/contract";
import { getgasPoolForTrade } from "./gasPoolTools";
require("dotenv").config();


export async function getProfitInMatic(trade: BoolTrade): Promise<{ profitInMatic: BigNumber, gasPool: Contract } | undefined> {

    const matic = gasTokens.WMATIC;

    try {

        if (trade.tokenOut.id == matic) {
            let profitInMatic = trade.profitJS;
            let gasPool = new Contract(trade.recipient.poolID, IPair, wallet);
            return { profitInMatic, gasPool };
        }

        if (trade.tokenIn.id == matic) {
            let inMatic = await getAmountsOut(trade.profitJS, trade.recipient.reserveOutjs, trade.recipient.reserveInjs)
            let profitInMatic = inMatic;
            let gasPool = new Contract(trade.recipient.poolID, IPair, wallet);
            return { profitInMatic, gasPool };

        } else {

            let g = await getgasPoolForTrade(trade).catch(async (error: any) => {
                logger.error("Error in getgasPoolForTrade: ", g?.gasTokenSymbol, "\n", error);
            })

            if (g) {

                const gasPool = g.gasPool;

                logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<BEGIN GAS CONVERSION LOOP: ", trade.ticker, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

                logger.info("Pair: ", trade.ticker, " finding profit through ", trade.tokenOut.symbol, "/", g.gasTokenSymbol, "/WMATIC")

                if (gasPool == undefined) {

                    logger.error("No gasPool Found for ", trade.tokenOut.symbol, " Please choose less esoteric coin.")
                    return undefined;

                } else {

                    logger.info("gasPoolID: ", gasPool.address)

                    //Case: trade.tokenOut.id is paired with WMATIC
                    if (gasPool.token1() == matic) {

                        logger.info("Case 1")
                        const reserves = await gasPool.getReserves();
                        const profitInMatic = await getAmountsOut(trade.profitJS, reserves[0], reserves[1])
                        // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return { profitInMatic, gasPool };

                    }

                    //Case: trade.tokenOut.id is paired with a WMATIC, but is in trade.tokenInID position
                    if (gasPool.token0() == matic) {

                        logger.info("Case 2")
                        const reserves = await gasPool.getReserves();
                        const profitInMatic = await getAmountsOut(trade.profitJS, reserves[1], reserves[0]);
                        // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return { profitInMatic, gasPool };

                    }



                    //TODO: REVIEW THESE CASES AS THEY KEEP RETURNING UNDEFINED EVEN THOUGH I KNOW A DAI/WMATIC POOL EXISTS



                    //Case: trade.tokenOut.id is paired with a gasToken in the trade.tokenIn position
                    if ((gasPool.token0() && gasPool.token1() != matic) && (gasPool.token0() == trade.tokenOut.id)) {
                        logger.info("Case 3")
                        const reserves = await gasPool.getReserves();
                        const profitInGasToken = await getAmountsOut(trade.profitJS, reserves[0], reserves[1]);//returns profit in gasToken (USDC, WETH, etc.)
                        const gasMaticPool = await (trade.loanPool.factory.getPair(gasPool.token1(), matic) ?? trade.recipient.factory.getPair(gasPool.token1(), matic) ?? undefined);
                        const gasSMaticPoolContract = new ethers.Contract(gasMaticPool, IPair, provider);
                        const profitInMatic = gasSMaticPoolContract.token1() == matic ? await getAmountsOut(trade.profitJS, reserves[0], reserves[1]) : await getAmountsOut(profitInGasToken, reserves[1], reserves[0]);
                        // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return { profitInMatic, gasPool };

                    }

                    //Case: trade.tokenOut.id is paired with a gasToken in the trade.tokenOut position
                    if ((gasPool.token0() && gasPool.token1() != matic) && (gasPool.token1() == trade.tokenOut.id)) {
                        logger.info("Case 4")
                        const reserves = await gasPool.getReserves();
                        const profitInGasToken = await getAmountsOut(trade.profitJS, reserves[1], reserves[0]);//returns profit in gasToken (USDC, WETH, etc.)
                        const gasMaticPool = await trade.loanPool.factory.getPair(gasPool.token0(), matic) ?? trade.recipient.factory.getPair(gasPool.token0(), matic) ?? undefined;
                        const gasSMaticPoolContract = new ethers.Contract(gasMaticPool, IPair, provider);
                        const profitInMatic = gasSMaticPoolContract.token1() == matic ? await getAmountsOut(trade.profitJS, reserves[1], reserves[0]) : await getAmountsOut(profitInGasToken, reserves[0], reserves[1]);
                        // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return { profitInMatic, gasPool };

                    }
                }
            }
        }

        logger.info("No gasPool Found for ", trade.ticker)

    } catch (error: any) {
        logger.info("////////////////////////ERROR IN getProfitInMatic////////////////////////")
        logger.info(error);

        return undefined;
    }
    return undefined;
}
