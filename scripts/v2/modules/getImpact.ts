// import { BigInt as BigInt } from 'bignumber.js';
import { BigInt } from "ethers";
interface Impact {
	priceImpact: bigint;
	newPrice: bigint;
}
// get priceImpact for each. 
export async function getImpact(reservesIn: bigint, reservesOut: bigint, amountIn: bigint, amountOut: bigint): Promise<Impact> {
	const reserveIn = reservesIn;
	const reserveOut = reservesOut;

	// Calculate the new reserves after the trade
	const newReserveIn = reserveIn.add(amountIn);
	const newReserveOut = reserveOut.add(amountOut);

	// Calculate the new price of the tokenIn (reserve0)
	const newPrice = newReserveOut.div(newReserveIn);

	// Calculate the price impact of the trade
	const marketPrice = reserveOut.div(reserveIn);
	const priceImpact = marketPrice.sub(newPrice).div(marketPrice).mul(BigInt.from(100));

	const impact = { priceImpact, newPrice };

	return impact;
}
