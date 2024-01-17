import {  Contract } from "ethers";
import { getQuoter, getProtocol } from "../../modules/getContract";
import { abi as IAlgPool } from '@cryptoalgebra/core/artifacts/contracts/AlgebraPool.sol/AlgebraPool.json';
import { signer } from "../../../constants/contract";
import { pu } from "../../modules/convertBN";


async function univ3Quote(poolID: string, tradeSize: bigint) {
	const quoter = getQuoter("QUICKV3")
	const pool = new Contract(poolID, IAlgPool, signer)
	try {
		let maxOut = await quoter.getFunction('quoteExactInputSingle').staticCall(
			await pool.token0(),
			await pool.token1(),
			tradeSize.toString(),
			'0'
		)
		console.log("maxOut: ")
		console.log(maxOut)
		return maxOut.amountOut;
	} catch (error: any) {
		console.log(error)
		console.trace(' >>>>>>>>>>>>>>>>>>>>>>>>>> ERROR IN maxOut : ')
		return 0n;
	}
}
univ3Quote(
	"0x89f485b9514E41276a58bBF54090D01B2Ce7e7b2",
	pu("10", 18)
)