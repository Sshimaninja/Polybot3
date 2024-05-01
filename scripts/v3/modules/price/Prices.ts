import { BigNumber as BN } from "bignumber.js";
import { abi as IUni3Pool } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { abi as IAlgPool } from "@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json";
import { PoolInfo, PoolStateV3, Slot0 } from "../../../../constants/interfaces";
import { Contract } from "ethers";
import { signer } from "../../../../constants/provider";
/**
 * @description
 * This class holds an array of prices for a given pair, using reserves.
 */

/* a bunch of esoteric bullshit from uniswap on how to get a price:
https://docs.uniswap.org/concepts/protocol/oracle

Deriving Price From A Tick
When we use "active tick" or otherwise to refer to the current tick of a pool, we mean the lower tick boundary that is closest to the current price.

When a pool is created, each token is assigned to either token0 or token1 based on the contract address of the tokens in the pair. 

Whether or not a token is token0 or token1 is meaningless; it is only used to maintain a fixed assignment for the purpose of relative valuation and general logic in the pool contract.

Deriving an asset price from the current tick is achievable due to the fixed expression across the pool contract of token0 in terms of token1.

An example of finding the price of WETH in a WETH / USDC pool, where WETH is token0 and USDC is token1:

You have an oracle reading that shows a return of tickCumulative as [70_000, 1_070_000], with an elapsed time between the observations of 10 seconds.

We can derive the average tick over this interval by taking the 
difference in accumulator values (1_070_000 - 70_000 = 1_000_000), and dividing by the time elapsed (1_000_000 / 10 = 100_000).

With a tick reading of 100_000, we can find the value of token1 (USDC) in terms of token0 (WETH) by using the current tick as i in the formula p(i) = 1.0001**i (see 6.1 in the whitepaper).

1.0001**100_000 ≅ 22015.5 USDC / WETH

Ticks are signed integers and can be expressed as a negative number, so for any circumstances where token0 is of a lower value than token1, a negative tick value will be returned by tickCumulative and a relative value of < 0 will be returned by a calculation of token0 in terms of token1.
*/

export class Prices {
	pi: PoolInfo
	ticker: string
	constructor(pi: PoolInfo, ticker: string) {
		this.pi = pi
		this.ticker = ticker
	}

	async prices(): Promise<PoolStateV3> {
		const slot0 = await this.getSlot0();
		const tick = slot0.tick;
		const price0 = Math.pow(1.0001, Number(tick));
		const price1 = 1 / Math.pow(1.0001, Number(tick));
		const fee = slot0.fee;
		const liq = slot0.liquidity;
		const unlocked = slot0.unlocked;
		const poolState: PoolStateV3 = {
			ticker: this.ticker,
			id: this.pi.id,
			protocol: this.pi.protocol,
			exchange: this.pi.exchange,
			price0: price0,
			price1: price1,
			liq: liq,
			tick: tick,
			fee: fee,
			unlocked: unlocked
		}
		console.log("PoolState: ")
		console.log(poolState)
		return poolState
	}



	async getSlot0(): Promise<Slot0> {
		let s0: Slot0 = {
			liquidity: 0n,
			sqrtPriceX96: 0n,
			sqrtPriceX96BN: BN(0),
			tick: 0n,
			fee: 0n,
			unlocked: false,
		}
		let pool: Contract;
		try {
			if (this.pi.protocol === 'UNIV3') {
				pool = new Contract(this.pi.id, IUni3Pool, signer)
				const slot0 = await pool.slot0()
				const liquidity = await pool.liquidity()
				s0 = {
					liquidity: liquidity,
					sqrtPriceX96: slot0.sqrtPriceX96,
					sqrtPriceX96BN: BN(slot0.sqrtPriceX96.toString()),
					tick: slot0.tick,
					fee: await pool.fee(),
					unlocked: slot0.unlocked,
				}
				// console.log("Slot0: UNIV3", slot0)
				return s0
			} else if (this.pi.protocol === 'ALG') {
				pool = new Contract(this.pi.id, IAlgPool, signer)
				const slot0 = await pool.globalState()
				const liquidity = await pool.liquidity()
				s0 = {
					liquidity: liquidity,
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
				this.pi.protocol +
				' getPoolState: ' +
				error.message
			)
			return s0
		}
		return s0
	}


}






