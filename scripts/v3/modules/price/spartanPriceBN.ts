import { BigNumber as BN } from 'bignumber.js';
import { ERC20token, Slot0 } from '../../../../constants/interfaces';
import { pu, fu, BN2BigInt } from '../../../modules/convertBN';
import { abi as IUniswapV3Pool } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { abi as IAlgebraPool } from "@cryptoalgebra/core/artifacts/contracts/interfaces/IAlgebraPool.sol/IAlgebraPool.json";
import { uniswapV3Exchange } from '../../../../constants/addresses';
import { Contract } from 'ethers';
import { signer } from '../../../../constants/provider';

export interface IRLBN {
	pool: string,
	fee: BN,
	exchange: string,
	sqrtRatioLow: BN,
	sqrtRatioHigh: BN,
	sqrtPrice: BN,
	price0: BN,
	price1: BN,
	liquidity: BN,
	tickLow: BN,
	tickHigh: BN,
	tickSpacing: BN,
	reserves0: BN,
	reserves1: BN,
}

export async function getLeanIRLBN(
	exchange: string,
	token0: ERC20token,
	token1: ERC20token,
	liquidity: bigint,
	poolID: string,
): Promise<IRLBN> {

	//let ct = BN(currentTick)
	//let tLow = BN(tickLow)
	//let tUp = BN(tickHigh)
	//let spLow = BN(sqrtRatioLow)
	//let spHigh = BN(sqrtRatioHigh)
	//let sqPrice = BN(sqrtPrice)
	//let L = BN(liq)

	let IPool = IUniswapV3Pool;
	if (uniswapV3Exchange[exchange].protocol === "ALG") {
		IPool = IAlgebraPool;
	}

	let poolContract = new Contract(poolID, IPool, signer);

	let s0: Slot0 = await poolContract.slot0()

	let r0 = BN(0)
	let r1 = BN(0)



	const sqrtPriceX96 = BN(Number(s0.sqrtPriceX96))
	const Q96 = BN(2 ** 96)
	const sp = sqrtPriceX96.multipliedBy(Q96).div(Q96)

	let ct = BN(s0.tick)
	let tickSpacing = BN(await poolContract.tickSpacing())



	// Can be used to isolate the range of ticks to calculate liquidity for
	let tLow: BN = (ct).div(tickSpacing).integerValue(BN.ROUND_DOWN).times(tickSpacing);
	let tUp: BN = (ct).div(tickSpacing).integerValue(BN.ROUND_UP).times(tickSpacing).plus(tickSpacing);
	// This is a range of ticks that represent a percentage controlled by slippage
	//ref: https://discord.com/channels/597638925346930701/1090098983176773764/1090119292684599316
	//ref: https://discord.com/channels/597638925346930701/607978109089611786/1079836969519038494
	//ref: https://discord.com/channels/597638925346930701/607978109089611786/1037050094404501595
	// let tickLow = (Math.floor(currentTick / tickspacing)) * (tickspacing - (tickspacing * ticksForRange));
	// let tickHigh = ((Math.floor(currentTick / tickspacing)) * tickspacing) + (tickspacing + (tickspacing * ticksForRange));

	//let sqrtRatioLow = Math.sqrt(1.0001 ** tickLow)//.toFixed(18))
	//let sqrtRatioHigh = Math.sqrt(1.0001 ** tickHigh)//.toFixed(18))

	let spLow = BN(1.0001).pow(tLow).sqrt()
	let spHigh = BN(1.0001).pow(tUp).sqrt()

	let L = BN((liquidity.toString()))



	let r: IRLBN = {
		pool: token0.symbol + '/' + token1.symbol,
		fee: BN(await poolContract.fee()),
		exchange: exchange,
		sqrtRatioLow: spLow,
		sqrtRatioHigh: spHigh,
		sqrtPrice: sp,
		price0: BN(0),
		price1: BN(0),
		liquidity: L,
		tickLow: tLow,
		tickHigh: tUp,
		tickSpacing: tickSpacing,
		reserves0: BN(0),
		reserves1: BN(0),
	}
	if (liquidity === 0n) {
		console.log(
			'Liquidity is zero for ',

			token0.id,
			token1.id,
			' on ',
			exchange,
			'. Skipping...'
		)
		return r
	} else {


		if (ct.lt(tLow)) {
			r0 = L.multipliedBy(spHigh.minus(spLow)).dividedBy(spLow.multipliedBy(spHigh))
		}
		if (ct.gte(tUp)) {
			r1 = L.multipliedBy(spHigh.minus(spLow))
		}
		if (ct.gte(tLow) && ct.lt(tUp)) {
			r0 = L.multipliedBy(spHigh.minus(sp)).div(sp.multipliedBy(spHigh))
			r1 = L.multipliedBy(sp.minus(spLow))
		}

		r.price0 = BN(1).div(sp.multipliedBy(sp))
		r.price1 = sp.multipliedBy(sp)
		const price0 = r.price0.toFixed(token0.decimals)
		const price1 = r.price1.toFixed(token1.decimals)

		//p0 = 1 / (sqrtPrice * sqrtPrice);
		//p1 = sqrtPrice * sqrtPrice;
		return r
	}
}

