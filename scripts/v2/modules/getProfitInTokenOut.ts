import { BigNumber } from "@ethersproject/bignumber";
import { getAmountsOut } from "./getAmountsIOLocal";

export async function getProfitInTokenOut(reserveIn: BigNumber, reserveOut: BigNumber, tradeSize: BigNumber, amountOut: BigNumber, amountRepay: BigNumber): Promise<[BigNumber, BigNumber]> {
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