import {  Contract } from "ethers";
import { getQuoterV2, getProtocol } from "../../modules/getContract";

export class V3Quote {
	exchange: string
	protocol: string
	pool: Contract;
	fee: number;
	quoter: Contract;


	constructor(pool: Contract, exchange: string, fee: number) {
		this.exchange = exchange;
		this.protocol = getProtocol(exchange);
		this.pool = pool;
		this.fee = fee
		this.quoter = getQuoterV2(exchange);
	}

	async maxOut(tradeSize: bigint) {
		if (tradeSize > (0)) {
			const uni3 = this.protocol == 'UNIV3' ? true : false;
			// console.log("Params: ", "Exchange: ", exchange, ' Protocol: ', protocol, ' ', feeTier, ' tradeSize: ', fu(tradeSize, this.pool.token0.decimals))
			let e = {
				'tokenIn': await this.pool.token0(),
				'tokenOut': await this.pool.token1(),
				'amountIn': tradeSize.toString(),
				'fee': uni3 ? await this.pool.fee() : this.fee,
				'sqrtPriceLimitX96': '0'
			}
			try {
				let maxOut = uni3 ? await this.quoter.getFunction('quoteExactInputSingle').staticCall(e) :
					await this.quoter.getFunction('quoteExactInputSingle').staticCall(
						e.tokenIn,
						e.tokenOut,
						e.amountIn,
						e.sqrtPriceLimitX96
					)
				// console.log(maxOut)
				return maxOut.amountOut;
			} catch (error: any) {
				console.log(error.reason)
				console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN maxOut : ', this.exchange, this.protocol)
				return 0n;
			}

		} else (console.log("getAmountOut: Amount in is zero, so amount out is zero: ", this.exchange, this.protocol))
		return 0n;
	}

	async minIn(amountOutExpected: bigint) {
		const uni3 = this.protocol == 'UNIV3' ? true : false;
		if (amountOutExpected >(0)) {
			let e = {
				'tokenIn': await this.pool.token0(),
				'tokenOut': await this.pool.token1(),
				'amount': amountOutExpected.toString(),
				'fee': uni3 ? await this.pool.fee() : this.fee,
				'sqrtPriceLimitX96': '0'
			}
			try {
				let minIn = uni3 ? await this.quoter.getFunction('quoteExactOutputSingle').staticCall(e) :
					await this.quoter.getFunction('quoteExactOutputSingle').staticCall(
						e.tokenIn,
						e.tokenOut,
						e.amount,
						e.sqrtPriceLimitX96
					)
				// console.log(minIn)
				return minIn.amountIn;
			} catch (error: any) {
				console.log(error)
				console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN minIn : ', e.tokenIn, e.tokenOut, this.exchange, this.protocol)
				return 0n;
			}
		}
		console.log("getAmountIn: Amount out is zero, so amount in is zero: ", this.exchange, this.protocol)
		return 0n;
	}

}

