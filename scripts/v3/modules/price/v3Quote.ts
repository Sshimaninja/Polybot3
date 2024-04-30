import { ethers, Contract } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as IUniswapV3Quoter } from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';
import { abi as IAlgebraQuoter } from '@cryptoalgebra/periphery/artifacts/contracts/interfaces/IQuoterV2.sol/IQuoterV2.json';
import { uniswapV2Exchange, ExchangeMap, algebraQuoter, uniswapV3Quoter, QuoterV3Map } from "../../../../constants/addresses";
import { Bool3Trade, ERC20token, Match3Pools, PoolState, Token } from "../../../../constants/interfaces";
import { provider, signer } from "../../../../constants/provider";
import { slippageTolerance } from "../../control";
import { BN2BigInt, fu, pu } from "../../../modules/convertBN";
// export async function getV3Quote(
// 	match: Match3Pools,
// 	state: PoolState,
// 	tradeSize: bigint
// ): Promise<bigint> {


//Returns the amount out received for a given exact input but for a swap of a single pool
// function quoteExactInputSingle(
// 	address tokenIn,
// 	address tokenOut,
// 	uint24 fee,
// 	uint256 amountIn,
// 	uint160 sqrtPriceLimitX96
// ) external returns(uint256 amountOut)

export class V3Quote {
	exchange: string;
	protocol: string;
	tokenIn: ERC20token;
	tokenOut: ERC20token;
	// trade: Bool3Trade;
	pool: Contract;
	QuoterV3: Contract;


	constructor(pool: Contract, exchange: string, protocol: string, tokenIn: Token, tokenOut: Token) {
		this.exchange = exchange;
		this.protocol = protocol
		this.pool = pool;
		this.tokenIn = tokenIn;
		this.tokenOut = tokenOut;
		this.QuoterV3 = new ethers.Contract(
			this.protocol === "UNIV3" ? uniswapV3Quoter[protocol] : algebraQuoter[protocol],
			this.exchange === "UNIV3" ? IUniswapV3Quoter : IAlgebraQuoter,
			signer
		);
	}

	async maxOut(tradeSize: bigint): Promise<bigint> {
		// console.log("Params: ", "Exchange: ", exchange, ' Protocol: ', protocol, ' ', feeTier, ' tradeSize: ', fu(tradeSize, this.pool.token0.decimals))
		try {
			const maxOut = this.protocol === "UNIV3" ? await this.QuoterV3.quoteExactInputSingle.call(
				this.pool,
				this.tokenIn.id,
				this.tokenOut.id,
				tradeSize,
				0
			) : this.protocol === "ALG" ? await this.QuoterV3.quoteExactInputSingle.call(
				this.tokenIn.id,
				this.tokenOut.id,
				tradeSize,
				0
			) : console.log("Exchange or protocol not supported: " + this.exchange + " " + this.protocol)
			return maxOut.amountOut;
		} catch (error: any) {
			console.log(error.reason)
			console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN getAmountOut : ', this.exchange, this.protocol)
			return 0n;
		}
	}

	async minIn(amountOutExpected: bigint): Promise<bigint> {
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
				) : console.log("Exchange or protocol not supported: " + this.exchange + " " + this.protocol)
				return minIn.amountIn;
			} catch (error: any) {
				console.log(error)
				console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN getAmountIn : ', this.exchange, this.protocol)
				return 0n;
			}
		}
		console.log("getAmountIn: Amount out is zero, so amount in is zero: ", this.exchange, this.protocol)
		return 0n;
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