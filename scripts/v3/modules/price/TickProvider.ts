import { TickDataProvider, Tick, TickConstructorArgs } from '@uniswap/v3-sdk';
import { ethers } from 'ethers';

export class TickProvider implements TickDataProvider {
	private v3Pool: ethers.Contract;

	constructor(v3Pool: ethers.Contract) {
		this.v3Pool = v3Pool;
	}


	async getTick(tickIdx: number): Promise<Tick> {
		const tickData = await this.v3Pool.ticks(tickIdx);
		return new Tick({
			index: tickIdx,
			liquidityGross: tickData.liquidityGross,
			liquidityNet: tickData.liquidityNet,
			feeGrowthOutside0X128: tickData.feeGrowthOutside0X128,
			feeGrowthOutside1X128: tickData.feeGrowthOutside1X128,
			tickCumulativeOutside: tickData.tickCumulativeOutside,
			secondsPerLiquidityOutsideX128: tickData.secondsPerLiquidityOutsideX128,
			initialized: tickData.initialized,
			price0: tickData.price0,
			price1: tickData.price1,
		} as TickConstructorArgs);
	}

	async nextInitializedTickWithinOneWord(tick: number, lte: boolean, tickSpacing: number): Promise<[number, boolean]> {
		const nextTick = await this.v3Pool.nextInitializedTickWithinOneWord(tick, lte, tickSpacing);
		return [nextTick, nextTick != 0];
	}
}
