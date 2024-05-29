import { ethers, Contract } from "ethers";
import { abi as IUniswapV3Quoter } from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';
import { abi as IAlgebraQuoter } from '@cryptoalgebra/periphery/artifacts/contracts/interfaces/IQuoterV2.sol/IQuoterV2.json';
import { uniswapV2Exchange, ExchangeMap, algebraQuoter, uniswapV3Quoter, QuoterV3Map, uniswapV3Exchange } from "../../../../constants/addresses";
import { Bool3Trade, ERC20token, ExactInput, ExactOutput, Match3Pools, PoolState, Token } from "../../../../constants/interfaces";
import { provider, signer } from "../../../../constants/provider";
import { algebraQuoteIn, algebraQuoteOut } from "./quoteAlgebra";
import { univ3QuoteIn, univ3QuoteOut } from "./quoteUniV3";

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
		this.QuoterV3 = uniswapV3Exchange[this.exchange].quoter;
	}

	async maxOut(tradeSize: bigint): Promise<ExactInput> {

		try {
			const maxOut: ExactInput = this.protocol === "UNIV3" ?
				await univ3QuoteOut(
					await this.pool.getAddress(),
					this.tokenIn,
					this.tokenOut,
					tradeSize,
				) : this.protocol === "ALG" ?
					await algebraQuoteOut(
						await this.pool.getAddress(),
						this.tokenIn,
						this.tokenOut,
						tradeSize,
					) : {
						amountOut: 0n,
						sqrtPriceX96After: 0n,
						initializedTicksCrossed: 0n,
						gasEstimate: 0n,
					}
			//console.log("maxOut: ", maxOut.amountOut.toString())
			return maxOut;
		} catch (error: any) {
			console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN getAmountOut : ', this.exchange, this.protocol)
			console.log("Error in v3Quote maxOut: ", error)
			return {
				amountOut: 0n,
				sqrtPriceX96After: 0n,
				initializedTicksCrossed: 0n,
				gasEstimate: 0n,
			};
		}
	}

	async minIn(amountOutExpected: bigint): Promise<ExactOutput> {
		if (amountOutExpected > 0n) {
			try {
				const minIn: ExactOutput = this.protocol === "UNIV3" ?
					await univ3QuoteIn(
						await this.pool.getAddress(),
						this.tokenIn,
						this.tokenOut,
						amountOutExpected,
					)
					: this.protocol === "ALG" ?
						await algebraQuoteIn(
							await this.pool.getAddress(),
							this.tokenIn,
							this.tokenOut,
							amountOutExpected,
						) : {
							amountIn: 0n,
							sqrtPriceX96After: 0n,
							initializedTicksCrossed: 0n,
							gasEstimate: 0n,
						}
				console.log("minIn: ", minIn.amountIn.toString())
				return minIn;
			} catch (error: any) {
				console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN getAmountIn : ', this.exchange, this.protocol)
				console.log("Error in v3Quote minIn: ", error)
				return {
					amountIn: 0n,
					sqrtPriceX96After: 0n,
					initializedTicksCrossed: 0n,
					gasEstimate: 0n,
				};
			}
		}
		console.log("getAmountIn: Amount out is zero, so amount in is zero: ", this.exchange, this.protocol)
		return {
			amountIn: 0n,
			sqrtPriceX96After: 0n,
			initializedTicksCrossed: 0n,
			gasEstimate: 0n,
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