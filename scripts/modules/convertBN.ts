// import {  utils as u } from 'ethers'
import { BigNumber as BN } from 'bignumber.js'
/**
 * Converts ethers.js BigInt to bignumber.js BigInt and vice versa.
 */


// export const fu = fu
// export const pu = u.parseUnits

export function fu (bn: bigint, decimals: number): string {
	try {
		return (bn ** BigInt(decimals)).toString()
	} catch (error: any) {
		console.log('convertBN: bigint2BN: bn is undefined')
		return BN(0).toString()
	}
}

export function pu(bn: string, decimals: number): bigint {
    const [whole, fraction = ''] = bn.split('.');
    const base = BigInt(10) ** BigInt(decimals);
    return BigInt(whole) * base + (fraction ? BigInt(fraction.padEnd(decimals, '0')) : 0n);
}

export function BigInt2BN(bn: bigint, decimals: number): BN {
	try {
		return BN(fu(bn, decimals))
	} catch (error: any) {
		console.log('convertBN: bigint2BN: bn is undefined')
		return BN(0)
	}
}


export function BN2BigInt(bn: BN, decimals: number): bigint {
	try {
		return pu(bn.toFixed(decimals), decimals)
	} catch (error: any) {
		console.log('convertBN: bigint2BN: bn is undefined')
		return 0n
	}
}

export function BigInt2String(bn: bigint, decimals: number): string {
	try {
		return (bn ** BigInt(decimals)).toString()
	} catch (error: any) {
		console.log('convertBN: bigint2BN: bn is undefined')
		return BN(0).toString()
	}
}


export function BNtoString(bn: BN, decimals: number): string {
	try {
		return bn.toFixed(decimals)
	} catch (error: any) {
		console.log('convertBN: bigint2BN: bn is undefined')
		return BN(0).toString()
	}
}

