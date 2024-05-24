import { BigNumber as BN } from 'bignumber.js';
import { ERC20token, Slot0, PoolInfo } from '../../../../constants/interfaces';
import { pu, fu, BN2BigInt } from '../../../modules/convertBN';
import { getIRLBN } from './getIRLBN';

export interface IRLbigint {
	pool: string,
	fee: bigint,
	exchange: string,
	sqrtRatioLow: bigint,
	sqrtRatioHigh: bigint,
	sqrtPrice: bigint,
	price0: bigint,
	price1: bigint,
	liquidity: bigint,
	tickLow: bigint,
	tickHigh: bigint,
	tickSpacing: bigint,
	reserves0: bigint,
	reserves1: bigint,
}

export async function getIRLbigint(
	s0: Slot0,
	poolInfo: PoolInfo,
	token0: ERC20token,
	token1: ERC20token,
	ts: number,
	liquidity: bigint,
): Promise<IRLbigint> {
	const d = await getIRLBN(s0, poolInfo, token0, token1, liquidity)

	let r: IRLbigint = {
		pool: d.pool,
		fee: BigInt(d.fee.toString()),
		exchange: d.exchange,
		sqrtRatioLow: BigInt(d.sqrtRatioLow.toString()),
		sqrtRatioHigh: BigInt(d.sqrtRatioHigh.toString()),
		sqrtPrice: BigInt(d.sqrtPrice.toString()),
		price0: pu(d.price0.toFixed(token0.decimals), token0.decimals),
		price1: pu(d.price1.toFixed(token1.decimals), token1.decimals),
		liquidity: BigInt(d.liquidity.toString()),
		tickLow: BigInt(d.tickLow.toString()),
		tickHigh: BigInt(d.tickHigh.toString()),
		tickSpacing: BigInt(d.tickSpacing.toString()),
		reserves0: pu(d.reserves0.toFixed(token0.decimals), token0.decimals),
		reserves1: pu(d.reserves1.toFixed(token1.decimals), token1.decimals),
	}
	return r
}