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

export async function gasVprofit(trade: BoolTrade,): Promise<Profit | undefined> {
    let profit: Profit;
    if (trade !== undefined) {

        const prices = await fetchGasPrice(trade);
        const gasPrice = BigNumber.from(prices.maxFee)
            .add(BigNumber.from(prices.maxPriorityFee))
            .mul(prices.gasEstimate.toNumber());

        var profitinMatic = await getProfitInMatic(trade);
        if (profitinMatic) {
            profit = {
                profit: profitinMatic.profitInMatic,
                gasCost: gasPrice,
                gasPool: profitinMatic.gasPool,
            }
            console.log("Profit: ", profit)
            return profit;
        } else {
            console.log("Trade is undefined.")
            return undefined;
        }
    }
}

