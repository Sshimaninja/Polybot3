import { Contract } from 'ethers'
import { getQuoterV2, getProtocol } from '../../../modules/getContract'
import { abi as IAlgPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json'
import { signer } from '../../../../constants/provider'
import { fu, pu } from '../../../modules/convertBN'
import { ERC20token, ExactInput, ExactOutput } from '../../../../constants/interfaces'
import { uniswap } from '../../../../typechain-types'
import { uniswapV3Exchange } from '../../../../constants/addresses'


export async function algebraQuoteOut(
	poolID: string,
	tokenIn: ERC20token,
	tokenOut: ERC20token,
	tradeSize: bigint
): Promise<ExactInput> {
	const quoter = uniswapV3Exchange['QUICKV3'].quoter

	//try {
	let maxOut = await quoter.quoteExactInputSingle.staticCall(
		tokenIn.id,
		tokenOut.id,
		tradeSize,
		'0'
	)
	const price: ExactInput = {
		amountOut: maxOut.amountOut,
		sqrtPriceX96After: maxOut.sqrtPriceX96After,
		initializedTicksCrossed: maxOut.initializedTicksCrossed,
		gasEstimate: maxOut.gasEstimate,
	}

	// console.log('maxOut: ')
	// console.log(maxOut)
	// console.log(price)
	return price
	//} catch (error: any) {
	//	console.log(error)
	//	console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN ALG maxOut : ', poolID, tokenIn.symbol, tokenOut.symbol, fu(tradeSize, tokenIn.decimals))
	//	return {
	//		amountOut: 0n,
	//		sqrtPriceX96After: 0n,
	//		initializedTicksCrossed: 0n,
	//		gasEstimate: 0n,


	//	}
	//}
}

export async function algebraQuoteIn(
	poolID: string,
	tokenIn: ERC20token,
	tokenOut: ERC20token,
	amountOut: bigint
): Promise<ExactOutput> {
	const quoter = uniswapV3Exchange['QUICKV3'].quoter
	//try {
	let minIn = await quoter.quoteExactOutputSingle.staticCall(

		tokenIn.id,
		tokenOut.id,
		amountOut,
		'0'

	)
	const price: ExactOutput = {
		amountIn: minIn.amountIn,
		sqrtPriceX96After: minIn.sqrtPriceX96After,
		initializedTicksCrossed: minIn.initializedTicksCrossed,
		gasEstimate: minIn.gasEstimate,
	}

	// console.log('maxOut: ')
	// console.log(maxOut)
	// console.log(price)
	return price
	//} catch (error: any) {
	//	console.log(error)
	//	console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN ALG minIn : ', poolID, tokenIn, tokenOut, amountOut)
	//	return {
	//		amountIn: 0n,
	//		sqrtPriceX96After: 0n,
	//		initializedTicksCrossed: 0n,
	//		gasEstimate: 0n,


	//	}
	//}
}
//const usdc: ERC20token = {
//	id: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
//	symbol: 'USDC',
//	decimals: 6,
//}
//const aave: ERC20token = {
//	id: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
//	symbol: 'AAVE',
//	decimals: 18,
//}
// algebraQuote(
// 	'0xD385ac9c9BCC8b345080365bf9d3345f20F97dB6',
// 	aave,
// 	usdc,
// 	pu('1', aave.decimals)
// )



/*
  function quoteExactInputSingle(
  ) public override returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)
*/