import { ethers, utils, BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { logger } from '../../../constants/contract'
import { abi as IPair } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
// import { abi as IPool } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { wallet } from '../../../constants/contract'
import { ReservesData, Pair, TradePair } from "../../../constants/interfaces";
/**
 * @description
 * This class returns an array of an array of reserves for an array of pairs.
 */
export class Reserves {
	static reserves: ReservesData[] = [];

	constructor(match: TradePair) {
		this.getReserves(match)
	}

	async getPoolIDs(pair: TradePair): Promise<string[]> {
		const poolIDs: string[] = [];
		for (const key in pair) {
			if (key.startsWith("pool")) {
				const poolID = pair[key as keyof TradePair];
				if (typeof poolID === "string") {
					poolIDs.push(poolID);
				}
			}
		}
		return poolIDs;
	}

	async getReserves(match: TradePair): Promise<ReservesData[]> {
		const poolIDs = await this.getPoolIDs(match);
		const reserves: ReservesData[] = [];
		for (const poolID of poolIDs) {
			let Pair = new ethers.Contract(poolID, IPair, wallet)
			if (Pair.address != '0x0000000000000000000000000000000000000000') {
				let reservesData = await Pair.getReserves().catch((error: any) => {
					logger.error("Error (getReserves(" + poolID + ")): " + error)
					logger.error(error)
					return undefined;
				});
				if (reservesData !== undefined) {
					const [reserveIn, reserveOut, blockTimestampLast] = reservesData;
					const reserveInBN = BN(utils.formatUnits(reserveIn, match.token0.decimals));
					const reserveOutBN = BN((utils.formatUnits(reserveOut, match.token1.decimals)));
					const reserveData: ReservesData = {
						reserveIn,
						reserveOut,
						reserveInBN,
						reserveOutBN,
						blockTimestampLast
					};
					reserves.push(reserveData);
				}
			} else {
				console.log("Pair" + poolID + " no longer exists!")
			}
		}
		return reserves;
	}

}
