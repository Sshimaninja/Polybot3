import { BigNumber, utils as u } from 'ethers'
import { BigNumber as BN } from 'bignumber.js'
/**
 * Converts ethers.js BigNumber to bignumber.js BigNumber and vice versa.
 */


export const fu = u.formatUnits
export const pu = u.parseUnits

export function JS2BN(bn: BigNumber, decimals: number): BN {
	try {
		return BN(fu(bn, decimals))
	} catch (error: any) {
		console.log('convertBN: JS2BN: bn is undefined')
		return BN(0)
	}
}

export function JS2BNS(bn: BigNumber, decimals: number): string {
	try {
		return BN(fu(bn, decimals)).toFixed(decimals)
	} catch (error: any) {
		console.log('convertBN: JS2BN: bn is undefined')
		return BN(0).toString()
	}
}

export function BN2JS(bn: BN, decimals: number): BigNumber {
	try {
		return pu(bn.toFixed(decimals), decimals)
	} catch (error: any) {
		console.log('convertBN: JS2BN: bn is undefined')
		return BigNumber.from(0)
	}
}

export function BN2JSS(bn: BN, decimals: number): string {
	try {
		return fu(bn.toFixed(decimals), decimals)
	} catch (error: any) {
		console.log('convertBN: JS2BN: bn is undefined')
		return BN(0).toString()
	}
}

