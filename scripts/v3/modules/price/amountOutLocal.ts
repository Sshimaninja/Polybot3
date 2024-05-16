// import ethers from 'ethers'
// import { BigNumber as BN } from 'bignumber.js'


// export async function amountOutLocal(
// 	liq: bigint,
// 	// price_cur: bigint,
// 	// price_next: bigint,
// 	sqrtPriceBefore: bigint,
// 	sqrtPriceAfter: bigint
// ) {

// 	const amount_in =
// 		liq * (sqrtPriceBefore - sqrtPriceAfter) / (sqrtPriceBefore - sqrtPriceAfter) // thi ai suggests `liq *` and the leson book says there is a purposefully insterted bug in the code. This could be it.

// 	// liq.times((sqrtPriceBefore)
// 	// 	.times(sqrtPriceAfter)
// 	// 	.div(sqrtPriceBefore.times(sqrtPriceAfter)))
// 	// // liq.times(sqrtp_cur).times(price_cur).div(
// 	// 	liq.times(price_cur).plus(sqrtp_next)
// 	// )
// 	const amount_out =
// 		liq * (sqrtPriceBefore - sqrtPriceAfter)
	
	


// }

















// # Swap ETH for USDC
// amount_in = 0.01337 * eth

// print(f"\nSelling {amount_in/eth} ETH")

// price_next = int((liq * q96 * sqrtp_cur) // (liq * q96 + amount_in * sqrtp_cur))

// print("New price:", (price_next / q96) ** 2)
// print("New sqrtP:", price_next)
// print("New tick:", price_to_tick((price_next / q96) ** 2))

// amount_in = calc_amount0(liq, price_next, sqrtp_cur)
// amount_out = calc_amount1(liq, price_next, sqrtp_cur)

// print("ETH in:", amount_in / eth)
// print("USDC out:", amount_out / eth)
// Its output:

// 	Selling 0.01337 ETH
// New price: 4993.777388290041
// New sqrtP: 5598789932670289186088059666432
// New tick: 85163
// ETH in: 0.013369999999998142
// USDC out: 66.80838889019013