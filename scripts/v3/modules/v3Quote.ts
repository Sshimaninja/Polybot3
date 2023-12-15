import { BigNumber, ethers, Contract } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as IUniswapV3Quoter } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import { abi as IAlgebraQuoter } from '@cryptoalgebra/periphery/artifacts/contracts/interfaces/IQuoter.sol/IQuoter.json';
import { algebraQuoter, uniswapQuoter } from "../../../constants/addresses";
import { Bool3Trade, Match3Pools, PoolState } from "../../../constants/interfaces";
import { provider, signer } from "../../../constants/contract";
import { slippageTolerance } from "../control";
import { BN2JS, fu, pu } from "../../modules/convertBN";

// export async function getV3Quote(
// 	match: Match3Pools,
// 	state: PoolState,
// 	tradeSize: BigNumber
// ): Promise<BigNumber> {


//Returns the amount out received for a given exact input but for a swap of a single pool	
// function quoteExactInputSingle(
// 	address tokenIn,
// 	address tokenOut,
// 	uint24 fee,
// 	uint256 amountIn,
// 	uint160 sqrtPriceLimitX96
// ) external returns(uint256 amountOut)

export class V3Quote {
	pool: Match3Pools;


	constructor(pool: Match3Pools, /*state: PoolState,*/) {
		this.pool = pool;
	}

	async getAmountOutMax(
		exchange: string,
		protocol: string,
		feeTier: number,
		tradeSize: BigNumber,
	): Promise<BigNumber> {
		// console.log("Params: ", "Exchange: ", exchange, ' Protocol: ', protocol, ' ', feeTier, ' tradeSize: ', fu(tradeSize, this.pool.token0.decimals))
		if (tradeSize.gt(0)) {
			try {
				if (protocol === "UNIV3") {
					const quoter = new ethers.Contract(uniswapQuoter[exchange], IUniswapV3Quoter, signer);
					// const d = {
					// 	exchange: exchange,
					// 	protocol: protocol,
					// 	feeTier: feeTier,
					// 	tradeSize: fu(tradeSize, this.pool.token0.decimals),
					// 	tokenIn: this.pool.token0.symbol,
					// 	tokenOut: this.pool.token1.symbol
					// }
					// console.log(d)
					// console.log("Getting quote for UniV3: ", exchange, protocol, feeTier, 'tradeSize: ', fu(tradeSize, this.pool.token0.decimals), 'token0: ', this.pool.token0.symbol, 'token1: ', this.pool.token1.symbol)
					const getAmountOutMax = await quoter.callStatic.quoteExactInputSingle(
						this.pool.token0.id,
						this.pool.token1.id,
						feeTier,
						tradeSize,
						0
					);
					// console.log("getAmountOutMax: ", protocol, " ", getAmountOutMax)
					return getAmountOutMax;
				}
				if (protocol === "ALG") {
					const quoter = new ethers.Contract(algebraQuoter[exchange], IAlgebraQuoter, signer);
					// const d = {
					// 	exchange: exchange,
					// 	protocol: protocol,
					// 	tradeSize: fu(tradeSize, this.pool.token0.decimals),
					// 	tokenIn: this.pool.token0.symbol,
					// 	tokenOut: this.pool.token1.symbol
					// }
					// console.log(d)
					// console.log("Getting quote for Algebra: ", exchange, protocol, feeTier, fu(tradeSize, this.pool.token0.decimals))
					const getAmountOutMax = await quoter.callStatic.quoteExactInputSingle(
						this.pool.token0.id,
						this.pool.token1.id,
						tradeSize,
						0
					);
					// console.log("getAmountOutMax: ", protocol, " ", getAmountOutMax)
					return getAmountOutMax.amountOut;
				} else {
					console.log("No protocol specified in quoteExactInputSingle. Protocol: ", protocol)
					return BigNumber.from(0);
				}
			} catch (error: any) {
				console.log(error.reason)
				console.trace('getAmountOutMax: ')
				return BigNumber.from(0);
			}
		} return BigNumber.from(0);
	}

	// Returns the amount in required to receive the given exact output amount
	// 	function quoteExactOutputSingle(
	// 		address tokenIn,
	// 		address tokenOut,
	// 		uint24 fee,
	// 		uint256 amountOut,
	// 		uint160 sqrtPriceLimitX96
	// 	) external returns(uint256 amountIn)
	async getAmountInMin(
		exchange: string,
		protocol: string,
		feeTier: number,
		amountOutExpected: BigNumber,
	): Promise<BigNumber> {
		// console.log("Params: ", "Exchange: ", exchange, "Protocol: ", protocol, feeTier, fu(amountOutExpected, this.pool.token0.decimals))
		// const quoter = new ethers.Contract((protocol == 'UNI' ? uniswapQuoter.UNI : uniswapQuoter.QUICKV3), UniswapV3Quoter, signer);//TESTING ONLY
		if (amountOutExpected.gt(0)) {
			if (protocol === "UNIV3") {
				console.log("quoteExactOutputSingle UNIV3: ")
				try {
					const d = {
						exchange: exchange,
						protocol: protocol,
						feeTier: feeTier,
						amountOutExpected: fu(amountOutExpected, this.pool.token1.decimals),
						tokenIn: this.pool.token1.symbol,
						tokenOut: this.pool.token0.symbol
					}
					// console.log(d)
					const quoter = new ethers.Contract(uniswapQuoter[exchange], IUniswapV3Quoter, signer);
					const getAmountInMin = await quoter.callStatic.quoteExactOutputSingle(
						this.pool.token1.id,
						this.pool.token0.id,
						feeTier,
						amountOutExpected,
						0
					);
					console.log("getAmountInMin: " + protocol + " ", getAmountInMin)
					return getAmountInMin;
				} catch (error: any) {
					console.log(error)
					console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN getAmountIn UNIV3: ')
					return BigNumber.from(0);
				}
			}
			if (protocol === "ALG") {
				console.log("quoteExactOutputSingle ALG: ")
				try {
					const d = {
						exchange: exchange,
						protocol: protocol,
						amountOutExpected: fu(amountOutExpected, this.pool.token1.decimals),
						tokenIn: this.pool.token1.symbol,
						tokenOut: this.pool.token0.symbol
					}
					// console.log(d)
					const quoter = new ethers.Contract(algebraQuoter[exchange], IAlgebraQuoter, signer);
					const getAmountInMin = await quoter.callStatic.quoteExactOutputSingle(
						this.pool.token1.id,
						this.pool.token0.id,
						amountOutExpected,
						0
					)
					console.log("getAmountInMin: " + protocol + " ", getAmountInMin)
					return getAmountInMin.amountIn;
				} catch (error: any) {
					console.log(error)
					console.trace('>>>>>>>>>>>>>>>>>>>>>>>>>>ERROR IN getAmountIn ALG: ')
					return BigNumber.from(0);
				}
			} else {
				console.log("No protocol specified in quoteExactOutputSingle. Protocol: ", protocol)
				return BigNumber.from(0);
			}

		} return BigNumber.from(0);
	}
}