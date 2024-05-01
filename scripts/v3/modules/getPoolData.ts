// import { Token } from '@uniswap/sdk-core'
// import JSBI from 'jsbi'
// import { fitFee } from './fitFee'
// import { chainID } from '../../../constants/addresses'
// import { abi as IERC20 } from '../../../interfaces/IERC20.json'
// import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
// import { ethers, Contract } from 'ethers'
// import { BigNumber as BN } from 'bignumber.js'
// import { signer, provider } from '../../../constants/provider'
// import {
// 	ReservesData,
// 	PoolState,
// 	PoolInfo,
// 	ERC20token,
// 	Slot0,
// } from '../../../constants/interfaces'

// import {
// 	Contract as MulticallContract,
// 	Provider as MulticallProvider,
// } from 'ethers-multicall'

// import { BN2BigInt, fu, pu } from '../../modules/convertBN'

// import {
// 	Pool,
// 	TickMath,
// 	TickListDataProvider,
// 	SwapMath,
// 	TickDataProvider,
// 	Position,
// 	Tick,
// } from '@uniswap/v3-sdk'

// export class PoolData {
// 	static liquidity: bigint[] = []
// 	poolInfo: PoolInfo
// 	pool: Contract
// 	token0: ERC20token
// 	token1: ERC20token

// 	constructor(
// 		poolInfo: PoolInfo,
// 		pool: Contract,
// 		token0: ERC20token,
// 		token1: ERC20token,
// 	) {
// 		this.pool = pool
// 		this.poolInfo = poolInfo
// 		this.token0 = token0
// 		this.token1 = token1
// 	}

// 	async getPoolState() {
// 		try {
// 			const slot0 = await this.pool.slot0()
// 			const tick = slot0.tick
// 			const tickSpacing = await this.pool.tickSpacing()
// 			const tickBitmapObservations =
// 				await this.pool.tickBitmapObservations()

// 			const tickIndices = this.getTickIndices(
// 				tickBitmapObservations,
// 				tickSpacing
// 			)

// 			const allTicks: Tick[] = []
// 			const results = await Promise.all(
// 				tickIndices.map((index) => this.pool.ticks(index))
// 			)
// 			for (let i = 0; i < tickIndices.length; i++) {
// 				const index = tickIndices[i]
// 				const ethersResponse = results[i]
// 				const tick = new Tick({
// 					index,
// 					liquidityGross: ethersResponse.liquidityGross.toString(),
// 					liquidityNet: ethersResponse.liquidityNet.toString(),
// 				})
// 				allTicks.push(tick)
// 			}

// 			const V3Pool = new Pool(
// 				new Token(
// 					chainID.POLYGON,
// 					await this.pool.token0(),
// 					this.token0.decimals,
// 					this.token0.symbol
// 				),
// 				new Token(
// 					chainID.POLYGON,
// 					await this.pool.token1(),
// 					this.token1.decimals,
// 					this.token1.symbol
// 				),
// 				this.poolInfo.fee, // replace with your pool's fee amount
// 				slot0.sqrtPriceX96,
// 				await this.pool.liquidity(),
// 				tick,
// 				await this.pool.ticks()
// 			)

// 			// Now you can make off-chain queries to the reserves
// 			const reserves0 = V3Pool.liquidity
// 			const reserves1 = V3Pool.liquidity

// 			return V3Pool
// 		} catch (error: any) {
// 			console.log(
// 				'Error in ' +
// 				this.poolInfo.protocol +
// 				' getPoolState: ' +
// 				error.message
// 			)
// 			console.log(error)
// 			return undefined
// 		}
// 	}

// 	getTickIndices(
// 		tickBitmapObservations: any[],
// 		tickSpacing: number
// 	): number[] {
// 		let tickIndices: number[] = []

// 		for (let observation of tickBitmapObservations) {
// 			const wordPos = observation.indexedTickBitmap
// 			const bitmap = observation.cardinality

// 			if (bitmap !== 0n) {
// 				for (let i = 0; i < 256; i++) {
// 					const bit = 1n
// 					const initialized = (bitmap & (bit << BigInt(i))) !== 0n
// 					if (initialized) {
// 						const tickIndex = (wordPos * 256 + i) * tickSpacing
// 						tickIndices.push(tickIndex)
// 					}
// 				}
// 			}
// 		}

// 		return tickIndices
// 	}
// }
