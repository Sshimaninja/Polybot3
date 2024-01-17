import { BigInt } from "@ethersproject/bignumber";
import { getAmountsOut } from "./getAmountsIOLocal";

export async function getProfitInTokenOut(reserveIn: bigint, reserveOut: bigint, tradeSize: bigint, amountOut: bigint, amountRepay: bigint): Promise<[BigInt, BigInt]> {
	const amountsMulti = await getAmountsOut(
		amountOut.sub(amountRepay), // token1 in
		reserveOut, // token1 out
		reserveIn // token0 in
	);
	const amountsDirect = await getAmountsOut(
		amountRepay.sub(amountOut), // token0 in
		reserveIn, // token0 out
		reserveOut // token1 in
	);
	const profitMulti = amountsMulti.sub(tradeSize); // token1 out - token1 in
	const profitDirect = amountsDirect.sub(tradeSize); // token1 out - token1 in
	return [profitMulti, profitDirect];
}