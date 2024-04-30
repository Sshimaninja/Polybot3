import { Contract } from 'ethers'
import { getQuoterV2, getProtocol } from '../../../modules/getContract'





// refer to this guy's post maybe:
// https://ethereum.stackexchange.com/a/147149


// Or refer to this guy re: uniswap oracle if this doesn't work:
// https://ethereum.stackexchange.com/questions/138440/uniswap-v3-version-of-v2s-getamountsin-getamountsout



export class V3Quote {
	exchange: string
	protocol: string
	pool: Contract
	fee: number
	quoter: Contract

	constructor(pool: Contract, exchange: string, fee: number) {
		this.exchange = exchange
		this.protocol = getProtocol(exchange)
		this.pool = pool
		this.fee = fee
		this.quoter = getQuoterV2(exchange)
	}

	async priceOut() {
		const uni3 = this.protocol == 'UNIV3' ? true : false
		let e = {
			tokenIn: await this.pool.token0(),
			tokenOut: await this.pool.token1(),
			amountIn: 1n,
			fee: uni3 ? await this.pool.fee() : this.fee,
			sqrtPriceLimitX96: '0',
		}
		try {
			let priceOut = uni3
				? await this.quoter.quoteExactInputSingle.staticCall(e)
				// If using algebra instead of uniswapv3
				: await this.quoter.quoteExactInputSingle.staticCall(
					e.tokenIn,
					e.tokenOut,
					e.amountIn,
					e.sqrtPriceLimitX96
				)
			// console.log(priceOut)
			return priceOut.amountOut
		} catch (error: any) {
			console.log(error.reason)
			console.trace(
				' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN priceOut : ',
				this.exchange,
				this.protocol
			)
			return 0n
		}
	}

	async priceIn() {
		const uni3 = this.protocol == 'UNIV3' ? true : false
		let e = {
			tokenIn: await this.pool.token1(),
			tokenOut: await this.pool.token0(),
			amountOut: 1n,
			fee: uni3 ? await this.pool.fee() : this.fee,
			sqrtPriceLimitX96: '0',
		}
		try {
			let priceIn = uni3
				? await this.quoter.quoteExactOutputSingle.staticCall(e)
				// If using algebra instead of uniswapv3
				: await this.quoter.quoteExactOutputSingle.staticCall(
					e.tokenIn,
					e.tokenOut,
					e.amountOut,
					e.sqrtPriceLimitX96
				)
			// console.log(priceIn)
			return priceIn.amountIn
		} catch (error: any) {
			console.log(error.reason)
			console.trace(
				' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN priceIn : ',
				this.exchange,
				this.protocol
			)
			return 0n
		}

	}

	async maxOut(tradeSize: bigint) {
		if (tradeSize > 0) {
			const uni3 = this.protocol == 'UNIV3' ? true : false
			// console.log("Params: ", "Exchange: ", exchange, ' Protocol: ', protocol, ' ', feeTier, ' tradeSize: ', fu(tradeSize, this.pool.token0.decimals))
			let e = {
				tokenIn: await this.pool.token0(),
				tokenOut: await this.pool.token1(),
				amountIn: tradeSize.toString(),
				fee: uni3 ? await this.pool.fee() : this.fee,
				sqrtPriceLimitX96: '0',
			}
			try {
				let maxOut = uni3
					? await this.quoter.quoteExactInputSingle.staticCall(e)
					// If using algebra instead of uniswapv3
					: await this.quoter.quoteExactInputSingle.staticCall(
						e.tokenIn,
						e.tokenOut,
						e.amountIn,
						e.sqrtPriceLimitX96
					)
				// console.log(maxOut)
				return maxOut.amountOut
			} catch (error: any) {
				console.log(error.reason)
				console.trace(
					' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN maxOut : ',
					this.exchange,
					this.protocol
				)
				return 0n
			}
		} else
			console.log(
				'getAmountOut: Amount in is zero, so amount out is zero: ',
				this.exchange,
				this.protocol
			)
		return 0n
	}

	async minIn(amountOutExpected: bigint) {
		const uni3 = this.protocol == 'UNIV3' ? true : false
		if (amountOutExpected > 0) {
			let e = {
				tokenIn: await this.pool.token0(),
				tokenOut: await this.pool.token1(),
				amount: amountOutExpected.toString(),
				fee: uni3 ? await this.pool.fee() : this.fee,
				sqrtPriceLimitX96: '0',
			}
			try {
				let minIn = uni3
					? await this.quoter.quoteExactOutputSingle.staticCall(e)
					// If using algebra instead of uniswapv3
					: await this.quoter.quoteExactOutputSingle.staticCall(
						e.tokenIn,
						e.tokenOut,
						e.amount,
						e.sqrtPriceLimitX96
					)
				// console.log(minIn)
				return minIn.amountIn
			} catch (error: any) {
				console.log(error)
				console.trace(
					' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN minIn : ',
					e.tokenIn,
					e.tokenOut,
					this.exchange,
					this.protocol
				)
				return 0n
			}
		}
		console.log(
			'getAmountIn: Amount out is zero, so amount in is zero: ',
			this.exchange,
			this.protocol
		)
		return 0n
	}
}
