// import { InRangeLiquidity } from "./modules/price/inRangeLiquidity";

// export async function getSize(
// 	irl0: InRangeLiquidity,
// 	irl1: InRangeLiquidity,
// ) {
// 	console.log('Getting trade size for target pool...')
// 	const d0 = await irl0.getSlot0()
// 	const d1 = await irl1.getSlot0()
// 	const sqpx96_0 = d0.sqrtPriceX96
// 	const sqpx96_1 = d0.sqrtPriceX96
// 	// If I always use token0 as the loan token, it's more likely to be WMATIC, which makes avaialble capital trades easier, meaning I can use the same amount of capital to trade more tokens.
// 	// This means the trade size is always based on the target pool, and the flashloan is always from the other pool.
// 	/* rules:
// 	- Loanpool is lower liquidity pool
// 	- Target pool is higher liquidity pool
// 	- trade size is based on target pool vs available capital in loan pool
// 	*/
// 	const targetPrice = sqpx96_0 > sqpx96_1 ? sqpx96_0 : sqpx96_1





// }

