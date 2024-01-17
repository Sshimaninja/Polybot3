
// import { Currency, CurrencyAmount, Percent, Token, TradeType, } from '@uniswap/sdk-core'
// import { Pool, Route, SwapOptions, SwapQuoter, SwapRouter, Trade, } from '@uniswap/v3-sdk'
// import { ethers } from 'ethers'
// import JSBI from 'jsbi'

// import { CurrentConfig } from '../config'
// import { ERC20_ABI, QUOTER_CONTRACT_ADDRESS, SWAP_ROUTER_ADDRESS, TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER, } from './constants'
// import { MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } from './constants'
// import { getPoolInfo } from './pool'
// import { getProvider, getWalletAddress, sendTransaction, TransactionState, } from './providers'
// import { fromReadableAmount } from './utils'

// // Helper Quoting and Pool Functions

// export async function getOutputQuote(route: Route<Currency, Currency>) {
// 	const provider = getProvider()

// 	if (!provider) {
// 		throw new Error('Provider required to get pool state')
// 	}

// 	const { calldata } = await SwapQuoter.quoteCallParameters(
// 		route,
// 		CurrencyAmount.fromRawAmount(
// 			CurrentConfig.tokens.in,
// 			fromReadableAmount(
// 				CurrentConfig.tokens.amountIn,
// 				CurrentConfig.tokens.in.decimals
// 			)
// 		),
// 		TradeType.EXACT_INPUT,
// 		{
// 			useQuoterV2: true,
// 		}
// 	)

// 	const quoteCallReturnData = await provider.call({
// 		to: QUOTER_CONTRACT_ADDRESS,
// 		data: calldata,
// 	})

// 	return ethers.defaultAbiCoder.decode(['uint256'], quoteCallReturnData)
// }

// export async function getTokenTransferApproval(
// 	token: Token
// ): Promise<TransactionState> {
// 	const provider = getProvider()
// 	const address = getWalletAddress()
// 	if (!provider || !address) {
// 		console.log('No Provider Found')
// 		return TransactionState.Failed
// 	}

// 	try {
// 		const tokenContract = new ethers.Contract(
// 			token.getAddress(),
// 			ERC20_ABI,
// 			provider
// 		)

// 		const transaction = await tokenContract.populateTransaction.approve(
// 			SWAP_ROUTER_ADDRESS,
// 			TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
// 		)

// 		return sendTransaction({
// 			...transaction,
// 			from: address,
// 		})
// 	} catch (e) {
// 		console.error(e)
// 		return TransactionState.Failed
// 	}
// }