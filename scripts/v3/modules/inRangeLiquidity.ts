import { ethers, Contract } from 'ethers'
import { PoolData } from './getPoolData'
import { BigNumber as BN } from 'bignumber.js'
import { wallet } from '../../../constants/environment'
import {
    ReservesData,
    PoolState,
    PoolInfo,
    ERC20token,
    Slot0,
    Reserves3,
} from '../../../constants/interfaces'
import { abi as IERC20 } from '../../../interfaces/IERC20.json'
import { sqrt } from './tradeMath'
import { BN2BigInt, BigInt2BN, fu, pu } from '../../modules/convertBN'
import { chainID } from '../../../constants/addresses'
import { TickMath, Position } from '@uniswap/v3-sdk'
import { TickMath as TickMathAlg } from '@cryptoalgebra/integral-sdk'
import { get } from 'http'
import { slippageTolerance } from '../control'
import { log } from 'console'
// import { token } from "../../../typechain-types/@openzeppelin/contracts";
// import { getPrice } from "./uniswapV3Primer";
/**
 * @description
 * For V3 this returns liquidity in range as well as pool 'state'.
 *
 */

export class InRangeLiquidity {
    static liquidity: bigint[] = []
    poolInfo: PoolInfo
    pool: Contract
    token0: ERC20token
    token1: ERC20token
    token0Contract: Contract
    token1Contract: Contract
    constructor(
        poolInfo: PoolInfo,
        pool: Contract,
        token0: ERC20token,
        token1: ERC20token
    ) {
        this.pool = pool
        this.poolInfo = poolInfo
        this.token0 = token0
        this.token1 = token1
        this.token0Contract = new Contract(token0.id, IERC20, wallet)
        this.token1Contract = new Contract(token1.id, IERC20, wallet)
    }

    async getSlot0(): Promise<Slot0> {
        let s0: Slot0 = {
            sqrtPriceX96: 0n,
            sqrtPriceX96BN: BN(0),
            tick: 0,
            fee: 0,
            unlocked: false,
        }
        try {
            if (this.poolInfo.protocol === 'UNIV3') {
                const slot0 = await this.pool.slot0()
                s0 = {
                    sqrtPriceX96: slot0.sqrtPriceX96,
                    sqrtPriceX96BN: BN(slot0.sqrtPriceX96.toString()),
                    tick: slot0.tick,
                    fee: await this.pool.fee(),
                    unlocked: slot0.unlocked,
                }
                // console.log("Slot0: UNIV3", slot0)
                return s0
            } else if (this.poolInfo.protocol === 'ALG') {
                const slot0 = await this.pool.globalState()
                s0 = {
                    sqrtPriceX96: slot0.price,
                    sqrtPriceX96BN: BN(slot0.price.toString()),
                    tick: slot0.tick,
                    fee: slot0.fee,
                    unlocked: slot0.unlocked,
                }
                // console.log("Slot0: ALG", s0)
                return s0
            }
        } catch (error: any) {
            console.log(
                'Error in ' +
                    this.poolInfo.protocol +
                    ' getPoolState: ' +
                    error.message
            )
            return s0
        }
        return s0
    }

    async getPriceBN(): Promise<{
        price: BN
        priceInBN: BN
        priceOutBN: BN
        priceInStr: string
        priceOutStr: string
    }> {
        const s0 = await this.getSlot0()
        // Calculate the price as (sqrtPriceX96 / 2^96)^2
        const price: BN = s0.sqrtPriceX96BN.div(BN(2).pow(96)).pow(2)

        // Adjust for token decimals
        //price0 = price * (10 ** this.token0.decimals) / (10 ** this.token1.decimals);
        //price1 = 1 / price0;
        const priceIn: BN = price
            .times(BN(10).pow(this.token0.decimals))
            .dividedBy(BN(10).pow(this.token1.decimals))
        const priceOut: BN = BN(1).div(priceIn)

        // Convert to string with appropriate number of decimals
        const priceInString: string = priceIn.toFixed(this.token0.decimals)
        const priceOutString: string = priceOut.toFixed(this.token1.decimals)
        // const buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(decimal0);

        const prices = {
            price: price,
            priceInBN: priceIn,
            priceOutBN: priceOut,
            priceInStr: priceInString,
            priceOutStr: priceOutString,
        }
        return prices
    }

    async getTokenAmounts(): Promise<{
        amount0wei: number
        amount1wei: number
        inRangeReserves0: string
        inRangeReserves1: string
    }> {
        const liquidity = await this.pool.liquidity()
        if (liquidity.isZero()) {
            console.log(
                'Liquidity is zero for ',
                this.token0.id,
                this.token1.id,
                ' on ',
                this.poolInfo.exchange,
                '. Skipping...'
            )
            return {
                amount0wei: 0,
                amount1wei: 0,
                inRangeReserves0: '0',
                inRangeReserves1: '0',
            }
        } else {
            const slot0 = await this.getSlot0()
            const sqrtPriceX96 = slot0.sqrtPriceX96
            const Q96 = BigInt(2) ** 96n
            const sqrtPrice = Number((sqrtPriceX96 * Q96) / Q96)
            // const sqrtPriceBN = BigInt2BN(sqrtPrice, 18);
            // const liquidityBN = BigInt2BN(liquidity, 18);

            let currentTick = slot0.tick
            let tickspacing = this.poolInfo.tickSpacing

            // let price: bigint = slot0.sqrtPriceX96BN / (Q96).pow(2);
            // let priceRange = price * (slippageTolerance.toNumber());
            // let tickRange = Math.log(priceRange) / Math.log(1.0001);
            // let ticksForRange = Math.round(tickRange / tickspacing) * tickspacing;

            // Can be used to isolate the range of ticks to calculate liquidity for
            let tickLow = Math.floor(currentTick / tickspacing) * tickspacing
            let tickHigh = Math.ceil(currentTick / tickspacing) * tickspacing // + tickspacing;

            // This is a range of ticks that represent a percentage controlled by slippage
            //ref: https://discord.com/channels/597638925346930701/1090098983176773764/1090119292684599316
            //ref: https://discord.com/channels/597638925346930701/607978109089611786/1079836969519038494
            //ref: https://discord.com/channels/597638925346930701/607978109089611786/1037050094404501595
            // let tickLow = (Math.floor(currentTick / tickspacing)) * (tickspacing - (tickspacing * ticksForRange));
            // let tickHigh = ((Math.floor(currentTick / tickspacing)) * tickspacing) + (tickspacing + (tickspacing * ticksForRange));

            let sqrtRatioA = Number(Math.sqrt(1.0001 ** tickLow).toFixed(18))
            let sqrtRatioB = Number(Math.sqrt(1.0001 ** tickHigh).toFixed(18))

            let amount0wei = 0
            let amount1wei = 0

            if (currentTick < tickLow) {
                amount0wei = Math.floor(
                    liquidity *
                        ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB))
                )
            }
            if (currentTick >= tickHigh) {
                amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA))
            }
            if (currentTick >= tickLow && currentTick < tickHigh) {
                amount0wei = Math.floor(
                    liquidity *
                        ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB))
                )
                amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA))
            }

            let amount0Human = (
                amount0wei /
                10 ** this.token0.decimals
            ).toFixed(this.token0.decimals)
            let amount1Human = (
                amount1wei /
                10 ** this.token1.decimals
            ).toFixed(this.token1.decimals)

            // let amount0wei = BN(0);
            // let amount1wei = BN(0);

            // if (currentTick < tickLow) {
            // 	amount0wei = liquidityBN.times(sqrtRatioB.minus(sqrtRatioA)) / (sqrtRatioA.times(sqrtRatioB)).integerValue(BN.ROUND_DOWN);
            // }
            // if (currentTick >= tickHigh) {
            // 	amount1wei = liquidityBN.times(sqrtRatioB.minus(sqrtRatioA)).integerValue(BN.ROUND_DOWN);
            // }
            // if (currentTick >= tickLow && currentTick < tickHigh) {
            // 	amount0wei = liquidityBN.times(sqrtRatioB.minus(sqrtPriceBN)) / (sqrtPriceBN.times(sqrtRatioB)).integerValue(BN.ROUND_DOWN);
            // 	amount1wei = liquidityBN.times(sqrtPriceBN.minus(sqrtRatioA)).integerValue(BN.ROUND_DOWN);
            // }

            // let amount0Human = amount0wei / (BN(10).pow(this.token0.decimals)).toFixed(this.token0.decimals);
            // let amount1Human = amount1wei / (BN(10).pow(this.token1.decimals)).toFixed(this.token1.decimals);
            console.log('sqrtRatioA: ' + sqrtRatioA)
            console.log('sqrtRatioB: ' + sqrtRatioB)
            console.log('sqrtPrice: ' + sqrtPrice)
            console.log('liquidity: ' + liquidity)
            console.log('tickLow: ' + tickLow)
            console.log('tickHigh: ' + tickHigh)

            console.log('Amount Token0 wei: ' + amount0wei)
            console.log('Amount Token1 wei: ' + amount1wei)
            console.log('Amount Token0 : ' + amount0Human)
            console.log('Amount Token1 : ' + amount1Human)

            return {
                amount0wei: amount0wei,
                amount1wei: amount1wei,
                inRangeReserves0: amount0Human,
                inRangeReserves1: amount1Human,
            }
        }
    }

    async getReserves(): Promise<{ reserves0: bigint; reserves1: bigint }> {
        const reserves0 = await this.token0Contract.balanceOf(this.poolInfo.id)
        const reserves1 = await this.token1Contract.balanceOf(this.poolInfo.id)
        return { reserves0, reserves1 }
    }

    async getPoolState(): Promise<PoolState> {
        let s0 = await this.getSlot0()
        const slot0: Slot0 = {
            sqrtPriceX96: s0.sqrtPriceX96,
            sqrtPriceX96BN: s0.sqrtPriceX96BN,
            tick: s0.tick,
            fee: s0.fee,
            unlocked: s0.unlocked,
        }

        const p = await this.getPriceBN()
        const liquidity = await this.pool.liquidity()

        let r = await this.getReserves()
        let a = await this.getTokenAmounts()

        const liquidityData: PoolState = {
            poolID: await this.pool.getAddress(),
            sqrtPriceX96: slot0.sqrtPriceX96,
            liquidity: liquidity,
            liquidityBN: BN(liquidity.toString()),
            reservesIn: r.reserves0,
            reservesOut: r.reserves1,
            reservesInBN: BN(fu(r.reserves0, this.token0.decimals)),
            reservesOutBN: BN(fu(r.reserves1, this.token1.decimals)),
            inRangeReserves0: a.inRangeReserves0,
            inRangeReserves1: a.inRangeReserves1,
            priceIn: p.priceInStr,
            priceOut: p.priceOutStr,
            priceInBN: p.priceInBN,
            priceOutBN: p.priceOutBN,
        }

        await this.viewData(liquidityData)
        return liquidityData
    }

    async viewData(l: PoolState) {
        const liquidityDataView = {
            ticker: this.token0.symbol + '/' + this.token1.symbol,
            poolID: this.pool.address,
            liquidity: l.liquidity.toString(),
            reserves0String: fu(l.reservesIn, this.token0.decimals),
            reserves1String: fu(l.reservesOut, this.token1.decimals),
            inRangeReserves0: l.inRangeReserves0,
            inRangeReserves1: l.inRangeReserves1,
            priceIn: l.priceIn,
            priceOut: l.priceOut,
        }
        console.log('liquiditydataview: ')
    }
}
