import { BigNumber, utils as u } from 'ethers'
import { BigNumber as BN } from 'bignumber.js'
/**
 * Converts ethers.js BigNumber to bignumber.js BigNumber and vice versa.
 */


export const f = u.formatUnits
export const p = u.parseUnits

export function JS2BN(bn: BigNumber, decimals: number): BN {
	return BN(f(bn, decimals))
}

export function JS2BNS(bn: BigNumber, decimals: number): string {
	return BN(f(bn, decimals)).toFixed(decimals)
}

export function BN2JS(bn: BN, decimals: number): BigNumber {
	return p(bn.toFixed(decimals), decimals)
}

export function BN2JSS(bn: BN, decimals: number): string {
	return f(bn.toFixed(decimals), decimals)
}

