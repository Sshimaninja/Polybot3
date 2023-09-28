import { ethers, Contract } from 'ethers';
import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import { fitFee } from './fitFee';
import { provider } from '../../../constants/contract'
import { chainID } from '../../../constants/addresses'
import { abi as IERC20 } from '../../../interfaces/IERC20.json';

export async function getPool(pool: Contract): Promise<Pool | undefined> {
	try {
		const t0 = new ethers.Contract(pool.token0(), IERC20, provider);
		const t1 = new ethers.Contract(pool.token1(), IERC20, provider);
		const token0 = new Token(chainID.POLYGON, pool.token0(), await t0.decimals(), await t0.symbol());
		const token1 = new Token(chainID.POLYGON, pool.token1(), await t1.decimals(), await t1.symbol());
		const fee = await pool.fee();
		const feeAmount = await fitFee(fee);
		const slot0 = await pool.slot0();
		const liquidity = await pool.liquidity();
		const tickSpacing = await pool.tickSpacing();
		const V3Pool = new Pool(
			token0,
			token1,
			feeAmount,
			slot0.sqrtPriceX96,
			liquidity,
			await slot0.tick,
		);
		return V3Pool
	} catch (e) {
		console.log(e)
		return undefined
	}
}