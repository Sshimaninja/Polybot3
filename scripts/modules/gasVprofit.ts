import { BigNumber, Contract, utils, ethers } from 'ethers'
import { BigNumber as BN } from "bignumber.js";
import { provider, flashwallet, logger } from '../../constants/contract'
import { boolFlash } from '../../constants/interfaces'
import { deployedMap, /*gasToken,*/ /*uniswapFactory*/ } from '../../constants/addresses'
// import { wallet } from '../deployTest'
// import { Network, Alchemy } from "alchemy-sdk";
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IFactory } from '@uniswap/v2-core/build/IUniswapV2Factory.json';
import { abi as IERC20 } from '@uniswap/v2-periphery/build/IERC20.json';
import { fetchGasPrice } from './fetchGasPrice';
import { V2Quote } from '../../utils/price/uniswap/v2/getPrice';
import { getAmountsIn, getAmountsOut } from './getAmountsIO';
require('dotenv').config()

type gasToken = { [gasToken: string]: string };

export const gasToken: gasToken = {
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    ETH: "0X7CEB23FD6B0DAD790BACD5BCB26288DDB0A9A074",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
}
type FactoryMap = { [protocol: string]: string };

export const uniswapFactory: FactoryMap = {
    SUSHI: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    QUICK: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
};

type RouterMap = { [protocol: string]: string };

export const uniswapRouter: RouterMap = {
    UNI: "0x7a250d5630b4caeaf5c20e6585a6e1ef6c992400",
    SUSHI: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    QUICK: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
};

const factorya = new ethers.Contract(uniswapFactory.SUSHI, IFactory, provider)
const factoryb = new ethers.Contract(uniswapFactory.QUICK, IFactory, provider)


export async function gasVprofit(
    trade: boolFlash,
): Promise<BigNumber> {
    const pair = new ethers.Contract(trade.recipient.factoryID, IPair, provider)
    const matic = gasToken.WMATIC;
    const prices = await fetchGasPrice(trade);
    let profitInMatic = BigNumber.from(0);
    const gasPrice = BigNumber.from(prices.maxFee)
        .add(BigNumber.from(prices.maxPriorityFee))
        .mul(prices.gasEstimate.toNumber());
    async function getProfitInMatic(): Promise<BigNumber | undefined> {
        try {
            let result = BigNumber.from(0);
            let profitToken = trade.tokenOutID;
            if (trade.tokenOutID == matic) {
                return trade.expectedProfit
            }
            if (trade.tokenInID == matic) {
                let inMaticBN = await getAmountsOut(BN(trade.expectedProfit.toString()), BN(trade.loanPool.reserveOut.toString()), BN(trade.loanPool.reserveIn.toString()))
                let profitInMatic = utils.parseUnits(inMaticBN.toString(),)
                return profitInMatic
            }
            let gasPoolID;
            for (const token of Object.keys(gasToken)) {

                const token0 = await pair.token0();
                const token1 = await pair.token1();

                logger.info("<<<<<<<<<<<<<<<<<<<<<<<<<BEGIN GAS CONVERSION LOOP: ", trade.tokenInID, "/", trade.tokenOutID, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                logger.info("Attempting to find gasPoolID to translate profit in ", trade.tokenOutID, " to WMATIC")
                logger.info("Finding profitToken & gasToken pair: ", token1, " ", token)

                logger.info("Attempting Gas Token Address: ", gasToken[token], "Pairing to Profit Token: ", token1)

                const gasPoolID = await factoryb.getPair(profitToken, gasToken[token]) ?? factorya.getPair(profitToken, gasToken[token]);

                if (gasPoolID == undefined || gasPoolID == "0x0000000000000000000000000000000000000000") {
                    // logger.error("No gasPool Found for ", await pair.token1, " ", token, ". Attempting next gasToken")
                    return
                } else {
                    logger.info("gasPoolID: ", gasPoolID)
                    let gasPool = new ethers.Contract(gasPoolID, IPair, provider);
                    //ERROR IS OCCURING BELOW   
                    //Case: profittoken is paired with WMATIC
                    if (gasPool.token1 == matic) {
                        logger.info("Case 1")
                        const reserves = await gasPool.getReserves();
                        const profitInMaticBN = await getAmountsOut(BN(trade.expectedProfit.toString()), BN(reserves[0].toString()), BN(reserves[1].toString()))
                        const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return profitInMatic;
                    }
                    //Case: profittoken is paired with a WMATIC, but is in trade.tokenInID position
                    if (gasPool.token1 == matic) {
                        logger.info("Case 3")
                        const reserves = await gasPool.getReserves();
                        const profitInMaticBN = await getAmountsOut(BN(trade.expectedProfit.toString()), BN(reserves[1].toString()), BN(reserves[0].toString()));
                        const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return profitInMatic;
                    }
                    //Case: profittoken is paired with a gasToken in the trade.tokenInID position
                    if ((gasPool.token0 && gasPool.token1 != matic) && (gasPool.token0 == profitToken)) {
                        logger.info("Case 4")
                        const reserves = await gasPool.getReserves();
                        const profitInGasToken = await getAmountsOut(BN(trade.expectedProfit.toString()), BN(reserves[0].toString()), BN(reserves[1].toString()));//returns profit in gasToken (USDC, WETH, etc.)
                        const gasMaticPool = await (factorya.getPair(gasPool.token1, matic) ?? factoryb.getPair(gasPool.token1, matic) ?? undefined);
                        const profitInMaticBN = gasMaticPool.trade.tokenOutID == matic ? await getAmountsOut(BN(trade.expectedProfit.toString()), BN(reserves[0].toString()), BN(reserves[1].toString())) : await getAmountsOut(profitInGasToken, reserves[1], reserves[0]);
                        const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return profitInMatic;
                    }
                    //Case: profittoken is paired with a gasToken in the trade.tokenOutID position
                    if ((gasPool.token0 && gasPool.token1 != matic) && (gasPool.token1 == profitToken)) {
                        logger.info("Case 5")
                        const reserves = await gasPool.getReserves();
                        const profitInGasToken = await getAmountsOut(BN(trade.expectedProfit.toString()), BN(reserves[1].toString()), BN(reserves[0].toString()));//returns profit in gasToken (USDC, WETH, etc.)
                        const gasMaticPool = await (factorya.getPair(gasPool.token0, matic) ?? factoryb.getPair(gasPool.token0, matic) ?? undefined);
                        const profitInMaticBN = gasMaticPool.trade.tokenOutID === matic ? await getAmountsOut(BN(trade.expectedProfit.toString()), BN(reserves[0].toString()), BN(reserves[1].toString())) : await getAmountsOut(BN(trade.expectedProfit.toString()), BN(reserves[1].toString()), BN(reserves[0].toString()));
                        const profitInMatic = utils.parseUnits(profitInMaticBN.toFixed(18), 18)
                        return profitInMatic;
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
    return (actualProfit !== undefined ? actualProfit : BigNumber.from(0));
}


