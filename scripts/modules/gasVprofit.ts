import { BigNumber, Contract, utils, ethers } from 'ethers'
import { BigNumber as BN } from "bignumber.js";
import { provider, flashwallet, logger } from '../../constants/contract'
import { BoolTrade } from '../../constants/interfaces'
import { Profit } from '../../constants/interfaces'
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { fetchGasPrice } from './fetchGasPrice';
import { getAmountsIn, getAmountsOut } from './getAmountsIOjs';
import { getProfitInMatic } from './getProfitInMatic';
import { uniswapV2Factory } from '../../constants/addresses';
require('dotenv').config()

export async function gasVprofit(trade: BoolTrade,): Promise<Profit> {
    let profit: Profit;
    console.log("[gasVprofit] Pair: ", trade.direction, trade.tokenIn.symbol, "/", trade.tokenOut.symbol, " @ ", trade.ticker)
    if (trade.direction != undefined) {
        console.log("Fetching gas price...")
        const prices = await fetchGasPrice(trade);
        const gasPrice = BigNumber.from(prices.maxFee)
            .add(BigNumber.from(prices.maxPriorityFee))
            .mul(prices.gasEstimate.toNumber());
        console.log("Gas cost: ", utils.formatUnits(gasPrice, 18))
        console.log("Fetching profit in Matic...")
        var profitinMatic = await getProfitInMatic(trade);
        if (profitinMatic != undefined) {
            console.log("Profit in Matic: ", utils.formatUnits(profitinMatic.profitInMatic, 18))
            if (profitinMatic.profitInMatic.gt(BigNumber.from(0))) {
                profit = {
                    profit: utils.formatUnits(profitinMatic.profitInMatic, 18),
                    gasCost: utils.formatUnits(gasPrice, 18),
                    gasPool: profitinMatic.gasPool.address,
                }
                console.log("Profit: ", profit)
                return profit;
            }
            if (profitinMatic.profitInMatic.eq(BigNumber.from(0))) {
                console.log("Trade is 0.")
                profit = {
                    profit: utils.formatUnits(profitinMatic.profitInMatic, 18),
                    gasCost: utils.formatUnits(gasPrice, 18),
                    gasPool: profitinMatic.gasPool.address,
                }
                console.log("Profit: ", profit)
                return profit;
            }
            if (profitinMatic.profitInMatic.lt(BigNumber.from(0))) {
                console.log("Trade is negative.")
                profit = {
                    profit: utils.formatUnits(profitinMatic.profitInMatic, 18),
                    gasCost: utils.formatUnits(gasPrice, 18),
                    gasPool: "undefined",
                };
                console.log("Profit: ", profit)
                return profit;
            }
        } else if (profitinMatic == undefined) {
            console.log("Profit in Matic is undefined.")
            profit = {
                profit: "undefined",
                gasCost: "undefined",
                gasPool: "undefined",
            };
            console.log("Profit: ", profit)
            return profit;
        }
    }
    if (trade.direction == undefined) {
        console.log("Trade direction is undefined.")
        return profit = {
            profit: "undefined",
            gasCost: "undefined",
            gasPool: "undefined",
        };
    }
    return profit = {
        profit: "undefined",
        gasCost: "undefined",
        gasPool: "undefined",
    };
}

