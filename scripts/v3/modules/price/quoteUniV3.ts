import { Contract } from 'ethers'
import { getQuoterV2, getProtocol } from '../../../modules/getContract'
import { abi as IUni3Pool } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json'
import { signer } from '../../../../constants/provider'
import { fu, pu } from '../../../modules/convertBN'
import { ERC20token, ExactInput } from '../../../../constants/interfaces'


export async function univ3Quote(
	poolID: string,
	tokenIn: ERC20token,
	tokenOut: ERC20token,
	tradeSize: bigint,
): Promise<ExactInput> {
	const quoter = getQuoterV2('UNIV3')
	const pool = new Contract(poolID, IUni3Pool, signer)

	let encoded = {
		tokenIn: tokenIn.id,
		tokenOut: tokenOut.id,
		amountIn: tradeSize,
		fee: await pool.fee(),
		sqrtPriceLimitX96: '0',
	}
	try {
		let maxOut = await quoter.quoteExactInputSingle.staticCall(encoded)
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
	} catch (error: any) {
		console.log(error)
		console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN maxOut : ')
		return {
			amountOut: 0n,
			sqrtPriceX96After: 0n,
			initializedTicksCrossed: 0n,
			gasEstimate: 0n,

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
// univ3Quote(
// 	'0x6EE39EFbE26e0C3DA5EfFB78D9DbE9183Fe0ACb3',
// 	aave,
// 	usdc,
// 	pu('1', aave.decimals),
// )

