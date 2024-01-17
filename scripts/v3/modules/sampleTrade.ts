// import { Currency, CurrencyAmount, Percent, Token, TradeType, } from '@uniswap/sdk-core'
// // import { Pool, Route, SwapOptions, SwapQuoter, SwapRouter, Trade, } from '@uniswap/v3-sdk'
// import { ethers } from 'ethers'
// import JSBI from 'jsbi'
// // import { getOutputQuote, getTokenTransferApproval } from './swapHelpers'


// import { ERC20_ABI, QUOTER_CONTRACT_ADDRESS, SWAP_ROUTER_ADDRESS, TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER, } from './constants'
// import { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } from './constants'
// import { getPoolInfo } from './pool'
// import { getProvider, getWalletAddress, sendTransaction, TransactionState, } from './providers'
// import { fromReadableAmount } from './utils'

// export class TokenTrade {

// }

// /**
//  * 
//  * Sample trade from Uni V3 docs sdk which we will adapt to flash arbitrage
//  */

// // Trading Functions

// export async function createArbFlash(): Promise<TokenTrade> {
// 	const poolData = await getPoolInfo()

// 	//create pool instances:

// 	//matches will be replaced by the data from the matchPools function

// 	const poolA = new Pool(
// 		matches.tokens.in,
// 		matches.tokens.out,
// 		matches.tokens.poolFee,
// 		poolData.sqrtPriceX96.toString(),
// 		poolData.liquidity.toString(),
// 		poolData.tick
// 	)

// 	const poolB = new Pool(
// 		matches.tokens.in,
// 		matches.tokens.out,
// 		matches.tokens.poolFee,
// 		poolData.sqrtPriceX96.toString(),
// 		poolData.liquidity.toString(),
// 		poolData.tick
// 	)

// 	const swapRouteA = new Route(
// 		[poolA, poolB],
// 		matches.tokens.in,
// 		matches.tokens.out
// 	)

// 	const swapRouteB = new Route(
// 		[poolB, poolA],
// 		matches.tokens.in,
// 		matches.tokens.out
// 	)

// 	const amountOutA = await getOutputQuote(swapRouteA)
// 	const amountOutB = await getOutputQuote(swapRouteB)
// 	const amountOut = amountOutA[0] > amountOutB[0] ? amountOutA[0] : amountOutB[0]

// 	const uncheckedTrade = Trade.createUncheckedTrade({
// 		route: swapRouteA,
// 		inputAmount: CurrencyAmount.fromRawAmount(
// 			matches.tokens.in,
// 			fromReadableAmount(
// 				matches.tokens.amountIn,
// 				matches.tokens.in.decimals
// 			).toString()
// 		),
// 		outputAmount: CurrencyAmount.fromRawAmount(
// 			matches.tokens.out,
// 			JSBI.BigInt(amountOut)
// 		),
// 		tradeType: TradeType.EXACT_INPUT,
// 	})

// 	return uncheckedTrade
// }

// // This needs converted to flash trade.

// export async function executeFlash(
// 	trade: TokenTrade
// ): Promise<TransactionState> {
// 	const walletAddress = getWalletAddress()
// 	const provider = getProvider()

// 	if (!walletAddress || !provider) {
// 		throw new Error('Cannot execute a trade without a connected wallet')
// 	}

// 	// Give approval to the router to spend the token
// 	const tokenApproval = await getTokenTransferApproval(matches.tokens.in)

// 	// Fail if transfer approvals do not go through
// 	if (tokenApproval !== TransactionState.Sent) {
// 		return TransactionState.Failed
// 	}

// 	const options: SwapOptions = {
// 		slippageTolerance: new Percent(500, 10000), // 50 bips, or 0.50%
// 		deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
// 		target: walletAddress,
// 	}

// 	const methodParameters = SwapRouter.swapCallParameters([trade], options)

// 	const tx = {
// 		data: methodParameters.calldata,
// 		to: SWAP_ROUTER_ADDRESS,
// 		value: methodParameters.value,
// 		from: walletAddress,
// 		maxFeePerGas: MAX_FEE_PER_GAS,
// 		maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
// 	}

// 	const res = await sendTransaction(tx)

// 	return res
// }
