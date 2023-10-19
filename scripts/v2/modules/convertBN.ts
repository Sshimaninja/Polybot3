import { BigNumber, utils as u } from 'ethers'
import { BigNumber as BN } from 'bignumber.js'
/**
 * Converts ethers.js BigNumber to bignumber.js BigNumber and vice versa.
 */


export const fu = u.formatUnits
export const pu = u.parseUnits

export function JS2BN(bn: BigNumber, decimals: number): BN {
	return BN(fu(bn, decimals))
}

export function JS2BNS(bn: BigNumber, decimals: number): string {
	return BN(fu(bn, decimals)).toFixed(decimals)
}

export function BN2JS(bn: BN, decimals: number): BigNumber {
	return pu(bn.toFixed(decimals), decimals)
}

export function BN2JSS(bn: BN, decimals: number): string {
	return fu(bn.toFixed(decimals), decimals)
}

