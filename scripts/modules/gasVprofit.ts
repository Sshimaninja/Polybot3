import { BigNumber, Contract, utils, ethers } from 'ethers'
import { BoolTrade } from '../../constants/interfaces'
import { Profit } from '../../constants/interfaces'
import { fetchGasPrice } from './fetchGasPrice';
import { getProfitInMatic } from './getProfitInMatic';
require('dotenv').config()
/**
 * Determines whether the profit is greater than the gas cost.
 * @param trade 
 * @returns Profit{profit: string, gasEstimate: BigNumber, gasCost: BigNumber, gasPool: string}
 */
export async function gasVprofit(trade: BoolTrade,): Promise<Profit> {
    let profit: Profit;
    console.log("Trade: ", trade.direction, trade.tokenIn.symbol, "/", trade.tokenOut.symbol, " @ ", trade.ticker)
    if (trade.direction != undefined) {
        const prices = await fetchGasPrice(trade);
        const gasPrice = BigNumber.from(prices.maxFee)
            .add(BigNumber.from(prices.maxPriorityFee))
            .mul(prices.gasEstimate.toNumber());

        var profitinMatic = await getProfitInMatic(trade);
        if (profitinMatic != undefined) {
            if (profitinMatic.profitInMatic.gt(BigNumber.from(0))) {
                profit = {
                    profit: utils.formatUnits(profitinMatic.profitInMatic, 18),
                    gasEstimate: prices.gasEstimate,
                    gasCost: gasPrice,
                    gasPool: profitinMatic.gasPool.address,
                }
                console.log("Profit: ", profit)
                return profit;
            }
            if (profitinMatic.profitInMatic.lte(BigNumber.from(0))) {
                console.log("Trade is negative.")
                return profit = {
                    profit: utils.formatUnits(profitinMatic.profitInMatic, 18),
                    gasEstimate: prices.gasEstimate,
                    gasCost: gasPrice,
                    gasPool: "undefined",
                };
            }
        } else if (profitinMatic == undefined) {
            console.log("Profit in Matic is undefined.")
            return profit = {
                profit: "undefined",
                gasEstimate: BigNumber.from(0),
                gasCost: BigNumber.from(0),
                gasPool: "undefined",
            };
        }
    }
    if (trade.direction == undefined) {
        console.log("Trade direction is undefined.")
        return profit = {
            profit: "undefined",
            gasEstimate: BigNumber.from(0),
            gasCost: BigNumber.from(0),
            gasPool: "undefined",
        };
    }
    return profit = {
        profit: "undefined",
        gasEstimate: BigNumber.from(0),
        gasCost: BigNumber.from(0),
        gasPool: "undefined",
    };
}

