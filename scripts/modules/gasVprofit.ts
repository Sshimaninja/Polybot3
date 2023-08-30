import { BigNumber, Contract, utils, ethers } from 'ethers'
import { BigNumber as BN } from "bignumber.js";
import { provider, flashwallet, logger } from '../../constants/contract'
import { BoolTrade } from '../../constants/interfaces'
import { Profit } from '../../constants/interfaces'
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { fetchGasPrice } from './fetchGasPrice';
import { getAmountsIn, getAmountsOut } from './getAmountsIOjs';
import { gasToken, uniswapV2Factory } from '../../constants/addresses';
require('dotenv').config()


const factorya = new ethers.Contract(uniswapV2Factory.SUSHI, IFactory, provider)
const factoryb = new ethers.Contract(uniswapV2Factory.QUICK, IFactory, provider)


export async function gasVprofit(
    trade: BoolTrade,
): Promise<Profit> {
    let profit: Profit;
    if (trade !== undefined) {
        // console.log("Trade: ", trade)//DEBUG

        const pair = new ethers.Contract(trade.recipient.poolID, IPair, provider)

        const matic = gasToken.WMATIC;
        const prices = await fetchGasPrice(trade);
        const gasPrice = BigNumber.from(prices.maxFee)
            .add(BigNumber.from(prices.maxPriorityFee))
            .mul(prices.gasEstimate.toNumber());

        async function getProfitInMatic(): Promise<BigNumber> {
            "Finding profit in Matic"
            try {
                let result = BigNumber.from(0);
                let profitToken = trade.tokenOut;

                if (trade.tokenOut.id == matic) {
                    return trade.profitJS;
                }
                if (trade.tokenIn.id == matic) {
                    let inMaticBN = await getAmountsOut(trade.profitJS, trade.loanPool.reserveOutjs, trade.loanPool.reserveInjs)
                    return inMaticBN;
                }
                for (const token of Object.keys(gasToken)) {

                    const token0 = await pair.token0();
                    const token1 = await pair.token1();

                    logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<BEGIN GAS CONVERSION LOOP: ", trade.ticker, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                    logger.info("Attempting to find gasPoolID to translate profit in ", trade.tokenOut.symbol, " to WMATIC")
                    const gasTokenKeys = Object.keys(gasToken);
                    for (let i = 0; i < gasTokenKeys.length; i++) {
                        logger.info("Finding profitToken & gasToken pair: ", trade.tokenOut.symbol, " ", gasTokenKeys[i]);

                        logger.info("Attempting Gas Token Address: ", gasToken[token], "Pairing to Profit Token: ", token1)

                        const gasPoolID = await factoryb.getPair(profitToken, gasToken[token]);

                        if (gasPoolID == undefined || gasPoolID == "0x0000000000000000000000000000000000000000") {
                            logger.error("No gasPool Found for ", token1, " ", token, ". Attempting next gasToken")
                            return BigNumber.from(0)
                        } else {
                            logger.info("gasPoolID: ", gasPoolID)
                            let gasPool = new ethers.Contract(gasPoolID, IPair, provider);
                            //Case: profittoken is paired with WMATIC
                            if (gasPool.token1.id == matic) {
                                logger.info("Case 1")
                                const reserves = await gasPool.getReserves();
                                const profitInMatic = await getAmountsOut(trade.profitJS, reserves[0], reserves[1])
                                // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                                return profitInMatic;
                            }
                            //Case: profittoken is paired with a WMATIC, but is in trade.tokenInID position
                            if (gasPool.token0.id == matic) {
                                logger.info("Case 2")
                                const reserves = await gasPool.getReserves();
                                const profitInMatic = await getAmountsOut(trade.profitJS, reserves[1], reserves[0]);
                                // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                                return profitInMatic;
                            }
                            //Case: profittoken is paired with a gasToken in the trade.tokenInID position
                            if ((gasPool.token0.id && gasPool.token1.id != matic) && (gasPool.token0.id == profitToken)) {
                                logger.info("Case 3")
                                const reserves = await gasPool.getReserves();
                                const profitInGasToken = await getAmountsOut(trade.profitJS, reserves[0], reserves[1]);//returns profit in gasToken (USDC, WETH, etc.)
                                const gasMaticPool = await (factorya.getPair(gasPool.token1.id, matic) ?? factoryb.getPair(gasPool.token1.id, matic) ?? undefined);
                                const gasSMaticPoolContract = new ethers.Contract(gasMaticPool, IPair, provider);
                                const profitInMatic = gasSMaticPoolContract.token1() == matic ? await getAmountsOut(trade.profitJS, reserves[0], reserves[1]) : await getAmountsOut(profitInGasToken, reserves[1], reserves[0]);
                                // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                                return profitInMatic;
                            }
                            //Case: profittoken is paired with a gasToken in the trade.match.token1 position
                            if ((gasPool.token0.id && gasPool.token1.id != matic) && (gasPool.token1.id == profitToken)) {
                                logger.info("Case 4")
                                const reserves = await gasPool.getReserves();
                                const profitInGasToken = await getAmountsOut(trade.profitJS, reserves[1], reserves[0]);//returns profit in gasToken (USDC, WETH, etc.)
                                const gasMaticPool = await (factorya.getPair(gasPool.token0.id, matic) ?? factoryb.getPair(gasPool.token1.id, matic) ?? undefined);
                                const gasSMaticPoolContract = new ethers.Contract(gasMaticPool, IPair, provider);
                                const profitInMatic = gasSMaticPoolContract.token1() === matic ? await getAmountsOut(profitInGasToken, reserves[0], reserves[1]) : await getAmountsOut(profitInGasToken, reserves[1], reserves[0]);
                                // const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                                return profitInMatic;
                            }
                        }
                    }
                }
                return result !== undefined ? result : BigNumber.from(0);
                // const profitInMatic = await getProfitInMatic()
                // const actualProfit = profitInMatic.sub(gasPrice);
                // return actualProfit;
            } catch (error: any) {
                logger.info("////////////////////////ERROR IN getProfitInMatic////////////////////////")
                logger.info(error);
                return BigNumber.from(0);
            }
        }
        var actualProfit = await getProfitInMatic();
        profit = {
            profit: actualProfit,
            gasCost: gasPrice,
        }
        console.log("Profit: ", profit)
        return profit;
    } else {
        console.log("Trade is undefined: ")
        console.log()
        return profit = {
            profit: BigNumber.from(0),
            gasCost: BigNumber.from(0),
        };
    }
}

