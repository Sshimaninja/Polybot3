import { Contract } from 'ethers'
import { getQuoterV2, getProtocol } from '../../../modules/getContract'
import { abi as IAlgPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json'
import { signer } from '../../../../constants/provider'
import { fu, pu } from '../../../modules/convertBN'
import { ERC20token, V3Q } from '../../../../constants/interfaces'

export async function algebraQuote(
	poolID: string,
	tokenIn: ERC20token,
	tokenOut: ERC20token,
	tradeSize: bigint
): Promise<V3Q> {
	const quoter = getQuoterV2('QUICKV3')
	const pool = new Contract(poolID, IAlgPool, signer)
	try {
		let maxOut = await quoter.quoteExactInputSingle.staticCall(
			tokenIn.id,
			tokenOut.id,
			tradeSize,
			'0'
		)
		const price: V3Q = {
			amountIn: tradeSize,
			data: maxOut,
			amountOut: maxOut[0],
		}

		// console.log('maxOut: ')
		// console.log(maxOut)
		// console.log(price)
		return price
	} catch (error: any) {
		console.log(error)
		console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN maxOut : ')
		return {
			amountIn: 0n,
			data: [0n, 0n, 0n],
			amountOut: 0n,

		}
	}
}
const usdc: ERC20token = {
	id: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
	symbol: 'USDC',
	decimals: 6,
}
const aave: ERC20token = {
	id: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
	symbol: 'AAVE',
	decimals: 18,
}
algebraQuote(
	'0xD385ac9c9BCC8b345080365bf9d3345f20F97dB6',
	aave,
	usdc,
	pu('1', aave.decimals)
)



/*
  function quoteExactInputSingle(
  ) public override returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)
*/