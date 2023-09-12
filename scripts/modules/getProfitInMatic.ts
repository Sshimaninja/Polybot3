import { BigNumber, ethers, Contract } from "ethers";
import { BoolTrade } from "../../constants/interfaces";
import { abi as IPair } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { getAmountsOut } from "./getAmountsIOLocal";
import { gasTokens } from "../../constants/addresses";
import { provider, logger, wallet } from "../../constants/contract";
import { getgasPoolForTrade } from "./gasPoolTools";
require("dotenv").config();

interface MaticProfit {
    profitInMatic: BigNumber,
    gasPool: Contract
}
export async function getProfitInMatic(trade: BoolTrade): Promise<MaticProfit> {

    const matic = gasTokens.WMATIC;
    // console.log('CHECK MATIC IS AN ADDRESS: ', matic)


    async function getProfitIfMatic(): Promise<MaticProfit> {

        if (trade.tokenOut.id == matic) {
            let profitInMatic = trade.profit;
            let gasPool = new Contract(trade.recipient.pool.address, IPair, wallet);
            return { profitInMatic, gasPool };
        }

        if (trade.tokenIn.id == matic) {
            let inMatic = await getAmountsOut(trade.profit, trade.recipient.reserveOut, trade.recipient.reserveIn)
            let profitInMatic = inMatic;
            let gasPool = new Contract(trade.recipient.pool.address, IPair, wallet);
            return { profitInMatic, gasPool };
        } else {
            return { profitInMatic: BigNumber.from(0), gasPool: new Contract(trade.recipient.pool.address, IPair, wallet) };
        }
    }


    async function getProfitIfNotMatic() {

        let g = await getgasPoolForTrade(trade).catch(async (error: any) => {
            logger.error("Error in getgasPoolForTrade: ", g?.gasTokenSymbol, "\n", error);
        })

        if (g?.gasTokenSymbol != undefined) {

            const gasPool = g.gasPool;

            logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<BEGIN GAS CONVERSION LOOP: ", trade.ticker, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

            logger.info("Pair: ", trade.ticker, " finding profit through ", trade.tokenOut.symbol, "/", g.gasTokenSymbol != "WMATIC" ? g.gasTokenSymbol : "", "/WMATIC")

            logger.info("gaspool.address: ", gasPool.address)

            //Case: trade.tokenOut.id is paired with WMATIC
            if (gasPool.token1() == matic) {

                logger.info("Case 1")
                const reserves = await gasPool.getReserves();
                const profitInMatic = await getAmountsOut(trade.profit, reserves[0], reserves[1])
                // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                return { profitInMatic, gasPool };

            }

            //Case: trade.tokenOut.id is paired with a WMATIC, but is in trade.tokenInID position
            if (gasPool.token0() == matic) {

                logger.info("Case 2")
                const reserves = await gasPool.getReserves();
                const profitInMatic = await getAmountsOut(trade.profit, reserves[1], reserves[0]);
                // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                return { profitInMatic, gasPool };

            }

            //Case: trade.tokenOut.id is paired with a gasToken in the trade.tokenIn position
            if ((gasPool.token0() && gasPool.token1() != matic) && (gasPool.token0() == trade.tokenOut.id)) {
                logger.info("Case 3")
                const reserves = await gasPool.getReserves();
                const profitInGasToken = await getAmountsOut(trade.profit, reserves[0], reserves[1]);//returns profit in gasToken/WMATIC
                const gasMaticPool = await (trade.loanPool.factory.getPair(gasPool.token1(), matic) ?? trade.recipient.factory.getPair(gasPool.token1(), matic) ?? undefined);
                console.log(gasMaticPool.token1, matic)
                const gasSMaticPoolContract = new ethers.Contract(gasMaticPool, IPair, provider);
                const profitInMatic = gasSMaticPoolContract.token1() == matic ? await getAmountsOut(trade.profit, reserves[0], reserves[1]) : await getAmountsOut(profitInGasToken, reserves[1], reserves[0]);
                // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                return { profitInMatic, gasPool };

            }

            //Case: trade.tokenOut.id is paired with a gasToken in the trade.tokenOut position
            if ((gasPool.token0() && gasPool.token1() != matic) && (gasPool.token1() == trade.tokenOut.id)) {
                logger.info("Case 4")
                const reserves = await gasPool.getReserves();
                const profitInGasToken = await getAmountsOut(trade.profit, reserves[1], reserves[0]);//returns profit in gasToken/MWATIC
                const gasMaticPool = await trade.loanPool.factory.getPair(gasPool.token0(), matic) ?? trade.recipient.factory.getPair(gasPool.token0(), matic) ?? undefined;
                console.log(gasMaticPool.token0, matic)
                const gasSMaticPoolContract = new ethers.Contract(gasMaticPool, IPair, provider);
                const profitInMatic = gasSMaticPoolContract.token1() == matic ? await getAmountsOut(trade.profit, reserves[1], reserves[0]) : await getAmountsOut(profitInGasToken, reserves[0], reserves[1]);
                // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                return { profitInMatic, gasPool };

            }
        } else {
            logger.error("No gasPool Found for ", trade.tokenOut.symbol, " Please choose less esoteric coin.")
            return { profitInMatic: BigNumber.from(0), gasPool: new Contract(trade.recipient.pool.address, IPair, wallet) };
        }
    }


    await getProfitIfMatic().then(async (result: MaticProfit) => {
        if (result) {
            return result;
        } else {
            await getProfitIfNotMatic().then((result: any) => {
                if (result) {
                    return result;
                } else {
                    return { profitInMatic: BigNumber.from(0), gasPool: new Contract(trade.recipient.pool.address, IPair, wallet) };
                }
            })
        }
    })
    console.log("No profit found for ", trade.ticker, "Profit in matic skipped.")
    return { profitInMatic: BigNumber.from(0), gasPool: new Contract(trade.recipient.pool.address, IPair, wallet) };

}

