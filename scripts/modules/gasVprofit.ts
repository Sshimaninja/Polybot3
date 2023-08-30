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


const factorya = new ethers.Contract(uniswapV2Factory.SUSHI, IFactory, provider)
const factoryb = new ethers.Contract(uniswapV2Factory.QUICK, IFactory, provider)


export async function gasVprofit(trade: BoolTrade,): Promise<Profit | undefined> {
    let profit: Profit;
    if (trade !== undefined) {
        // console.log("Trade: ", trade)//DEBUG



        const prices = await fetchGasPrice(trade);
        const gasPrice = BigNumber.from(prices.maxFee)
            .add(BigNumber.from(prices.maxPriorityFee))
            .mul(prices.gasEstimate.toNumber());

        // const profitInMatic = await getProfitInMatic()
        // const actualProfit = profitInMatic.sub(gasPrice);
        // return actualProfit;

        var profitinMatic = await getProfitInMatic(trade);
        profit = {
            profit: profitinMatic.profitInMatic,
            gasCost: gasPrice,
            gasPool: profitinMatic.gasPoolID,
        }
        console.log("Profit: ", profit)
        return profit;
    } else {
        console.log("Trade is undefined: ")
        return undefined;
    }
}

