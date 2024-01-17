// import {  ethers, Contract } from "ethers";
// import { BigNumber as BN } from "bignumber.js";
// import { abi as IUniswapV3Quoter } from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';
// import { abi as IAlgebraQuoter } from '@cryptoalgebra/periphery/artifacts/contracts/interfaces/IQuoterV2.sol/IQuoterV2.json';
// import { getProtocol, getQuoter, algebraQuoter, uniswapQuoter, QuoterV2Map } from "../../../constants/addresses";
// import { Bool3Trade, Match3Pools, PoolState } from "../../../constants/interfaces";
// import { provider, signer } from "../../../constants/contract";
// import { slippageTolerance } from "../control";
// import { BN2JS, fu, pu } from "../../modules/convertBN";
// // export async function getV3Quote(
// // 	match: Match3Pools,
// // 	state: PoolState,
// // 	tradeSize: bigint
// // ): Promise<BigInt> {


// //Returns the amount out received for a given exact input but for a swap of a single pool
// // function quoteExactInputSingle(
// // 	address tokenIn,
// // 	address tokenOut,
// // 	uint24 fee,
// // 	uint256 amountIn,
// // 	uint160 sqrtPriceLimitX96
// // ) external returns(uint256 amountOut)

// export class V3Quote {
// 	exchange: string
// 	protocol: string
// 	pool: Contract;
// 	QuoterV2: Contract;


// 	constructor(pool: Contract, exchange: string) {
// 		this.exchange = exchange;
// 		this.protocol = getProtocol(exchange);
// 		this.pool = pool;
// 		this.QuoterV2 = new ethers.Contract(getQuoter(exchange)[exchange], IUniswapV3Quoter, signer);
// 	}

// 	async maxOut(tradeSize: bigint): Promise<BigInt> {
// 		// console.log("Params: ", "Exchange: ", exchange, ' Protocol: ', protocol, ' ', feeTier, ' tradeSize: ', fu(tradeSize, this.pool.token0.decimals))
// 		try {
// 			const maxOut = this.protocol === "UNIV3" ? await this.QuoterV2.callStatic.quoteExactInputSingle(
// 				this.pool.token0.id,
// 				this.pool.token1.id,
// 				this.pool.fee(),
// 				tradeSize,
// 				0
// 			) : this.protocol === "ALG" ? await this.QuoterV2.callStatic.quoteExactInputSingle(
// 				this.pool.token0.id,
// 				this.pool.token1.id,
// 				tradeSize,
// 				0
// 			) : console.log("Exchange or protocol not supported: " + this.exchange + " " + this.protocol)
// 			return maxOut.amountOut;
// 		} catch (error: any) {
// 			console.log(error.reason)
// 			console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN getAmountOut : ', this.exchange, this.protocol)
// 			return 0n;
// 		}
// 	}

// 	async minIn(amountOutExpected: bigint): Promise<BigInt> {
// 		if (amountOutExpected.gt(0)) {
// 			try {
// 				const minIn = this.protocol = "UNIV3" ? await this.QuoterV2.callStatic.quoteExactOutputSingle(
// 					this.pool.token0.id,
// 					this.pool.token1.id,
// 					this.pool.fee(),
// 					amountOutExpected,
// 					0
// 				) : this.protocol = "ALG" ? await this.QuoterV2.callStatic.quoteExactOutputSingle(
// 					this.pool.token0.id,
// 					this.pool.token1.id,
// 					amountOutExpected,
// 					0
// 				) : console.log("Exchange or protocol not supported: " + this.exchange + " " + this.protocol)
// 				return minIn.amountIn;
// 			} catch (error: any) {
// 				console.log(error)
// 				console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN getAmountIn : ', this.exchange, this.protocol)
// 				return 0n;
// 			}
// 		}
// 		console.log("getAmountIn: Amount out is zero, so amount in is zero: ", this.exchange, this.protocol)
// 		return 0n;
// 	}

// 	async QuoteExactInSingleQuoterV2(
// 		tradeSize: bigint
// 	) {
// 		let encoded = { 'tokenIn': this.pool.token0.id, 'tokenOut': this.pool.token1.id, 'fee': this.pool.fee(), 'amountIn': tradeSize.toString(), 'sqrtPriceLimitX96': '0' };
// 		let myData2 = await this.QuoterV2.callStatic.quoteExactInputSingle(encoded)

// 		console.log("Amount out in lowest Decimal:  " + myData2.amountOut.toString())
// 		console.log("sqrtRatioX96 after: " + myData2.sqrtPriceX96After.toString())
// 		console.log("initialized ticks crossed: " + myData2.initializedTicksCrossed.toString())
// 		console.log("Gas Estimate (always add some): " + myData2.gasEstimate.toString())
// 		console.log("Amount Out human needs deciamals:  " + (myData2[0] / (10 ** this.pool.token1.decimals)).toString())

// 		return myData2.amountOut;
// 	}
// }