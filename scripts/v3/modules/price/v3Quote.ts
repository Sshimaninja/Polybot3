import { ethers, Contract } from "ethers";
import { abi as IUniswapV3Quoter } from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';
import { abi as IAlgebraQuoter } from '@cryptoalgebra/periphery/artifacts/contracts/interfaces/IQuoterV2.sol/IQuoterV2.json';
import { uniswapV2Exchange, ExchangeMap, algebraQuoter, uniswapV3Quoter, QuoterV3Map } from "../../../../constants/addresses";
import { Bool3Trade, ERC20token, Match3Pools, PoolState, Token, V3Q } from "../../../../constants/interfaces";
import { provider, signer } from "../../../../constants/provider";
import { algebraQuote } from "./quoteAlgebra";
import { univ3Quote } from "./quoteUniV3";

export class V3Quote {
	exchange: string;
	protocol: string;
	tokenIn: ERC20token;
	tokenOut: ERC20token;
	pool: Contract;
	QuoterV3: Contract;



	constructor(pool: Contract, exchange: string, protocol: string, tokenIn: Token, tokenOut: Token) {
		this.exchange = exchange;
		this.protocol = protocol
		this.pool = pool;
		this.tokenIn = tokenIn;
		this.tokenOut = tokenOut;
		const address = this.protocol === "UNIV3" ? uniswapV3Quoter[exchange] : algebraQuoter[exchange];
		if (!address) {
			console.error(`Address not defined for protocol: ${protocol}`);
		}
		this.QuoterV3 = new ethers.Contract(
			this.protocol === "UNIV3" ? uniswapV3Quoter[exchange] : algebraQuoter[exchange],
			this.exchange === "UNIV3" ? IUniswapV3Quoter : IAlgebraQuoter,
			signer
		);
	}

	async maxOut(tradeSize: bigint): Promise<V3Q> {
		// console.log("Params: ", "Exchange: ", exchange, ' Protocol: ', protocol, ' ', feeTier, ' tradeSize: ', fu(tradeSize, this.pool.token0.decimals))
		try {
			const maxOut: V3Q = this.protocol === "UNIV3" ?
				await univ3Quote(
					await this.pool.getAddress(),
					this.tokenIn,
					this.tokenOut,
					tradeSize,
				) : this.protocol === "ALG" ?
					await algebraQuote(
						await this.pool.getAddress(),
						this.tokenIn,
						this.tokenOut,
						tradeSize,
					) : {
						amountIn: 0n,
						data: [0n, 0n, 0n],
						amountOut: 0n,
					}
			return maxOut;
		} catch (error: any) {
			console.log(error.reason)
			console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN getAmountOut : ', this.exchange, this.protocol)
			return {
				amountIn: 0n,
				data: [0n, 0n, 0n],
				amountOut: 0n,
			};
		}
	}

	async minIn(amountOutExpected: bigint): Promise<V3Q> {
		if (amountOutExpected > 0n) {
			try {
				const minIn = this.protocol = "UNIV3" ? await this.QuoterV3.quoteExactOutputSingle.call(
					this.tokenIn.id,
					this.tokenOut.id,
					this.pool.fee(),
					amountOutExpected,
					0
				) : this.protocol = "ALG" ? await this.QuoterV3.quoteExactOutputSingle.call(
					this.tokenIn.id,
					this.tokenOut.id,
					amountOutExpected,
					0
				) : {
					amountIn: 0n,
					data: [0n, 0n, 0n],
					amountOut: 0n,
				}
				return minIn;
			} catch (error: any) {
				console.log(error)
				console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN getAmountIn : ', this.exchange, this.protocol)
				return {
					amountIn: 0n,
					data: [0n, 0n, 0n],
					amountOut: 0n,
				};
			}
		}
		console.log("getAmountIn: Amount out is zero, so amount in is zero: ", this.exchange, this.protocol)
		return {
			amountIn: 0n,
			data: [0n, 0n, 0n],
			amountOut: 0n,
		};
	}

	// async QuoteExactInSingleQuoterV2(
	// 	tradeSize: bigint
	// ) {
	// 	let encoded = { 'tokenIn': this.tokenIn.id, 'tokenOut': this.tokenOut.id, 'fee': this.pool.fee(), 'amountIn': tradeSize.toString(), 'sqrtPriceLimitX96': '0' };
	// 	let myData2 = await this.QuoterV3.quoteExactInputSingle.call(encoded)

	// 	console.log("Amount out in lowest Decimal:  " + myData2.amountOut.toString())
	// 	console.log("sqrtRatioX96 after: " + myData2.sqrtPriceX96After.toString())
	// 	console.log("initialized ticks crossed: " + myData2.initializedTicksCrossed.toString())
	// 	console.log("Gas Estimate (always add some): " + myData2.gasEstimate.toString())
	// 	console.log("Amount Out human needs deciamals:  " + (myData2[0] / (10 ** this.tokenOut.decimals)).toString())

	// 	return myData2.amountOut;
	// }
}