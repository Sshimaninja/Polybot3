import { BigNumber, Contract } from "ethers";
import { getQuoter, getProtocol } from "../../modules/getContract";

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
		this.quoter = getQuoter(exchange);
	}

	async maxOut(tradeSize: BigNumber) {
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
			let maxOut = uni3 ? await this.quoter.callStatic.quoteExactInputSingle(e) :
				await this.quoter.callStatic.quoteExactInputSingle(
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
			return BigNumber.from(0);
		}

	}

	async minIn(amountOutExpected: BigNumber) {
		const uni3 = this.protocol == 'UNIV3' ? true : false;
		if (amountOutExpected.gt(0)) {
			let e = {
				'tokenIn': await this.pool.token0(),
				'tokenOut': await this.pool.token1(),
				'amount': amountOutExpected.toString(),
				'fee': uni3 ? await this.pool.fee() : this.fee,
				'sqrtPriceLimitX96': '0'
			}
			try {
				let minIn = uni3 ? await this.quoter.callStatic.quoteExactOutputSingle(e) :
					await this.quoter.callStatic.quoteExactOutputSingle(
						e.tokenIn,
						e.tokenOut,
						e.amount,
						e.sqrtPriceLimitX96
					)
				// console.log(minIn)
				return minIn.amountIn;
			} catch (error: any) {
				console.log(error)
				console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN minIn : ', this.exchange, this.protocol)
				return BigNumber.from(0);
			}
		}
		console.log("getAmountIn: Amount out is zero, so amount in is zero: ", this.exchange, this.protocol)
		return BigNumber.from(0);
	}

}

