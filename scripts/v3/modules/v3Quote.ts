import { BigNumber, ethers, Contract } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { abi as IUniswapV3Quoter } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import { abi as AlgebraQuoter } from '@cryptoalgebra/periphery/artifacts/contracts/interfaces/IQuoter.sol/IQuoter.json';
import { algebraQuoter, uniswapQuoter } from "../../../constants/addresses";
import { Bool3Trade, Match3Pools, PoolState } from "../../../constants/interfaces";
import { provider, signer } from "../../../constants/contract";
import { fu } from "../../modules/convertBN";

// export async function getV3Quote(
// 	match: Match3Pools,
// 	state: PoolState,
// 	tradeSize: BigNumber
// ): Promise<BigNumber> {


//Returns the amount out received for a given exact input but for a swap of a single pool	
// function quoteExactInputSingle(
// 	address tokenIn,
// 	address tokenOut,
// 	uint24 fee,
// 	uint256 amountIn,
// 	uint160 sqrtPriceLimitX96
// ) external returns(uint256 amountOut)

export class V3Quote {
	pool: Match3Pools;
	state: PoolState;
	tradeSize: BigNumber;

	constructor(pool: Match3Pools, state: PoolState, tradeSize: BigNumber) {
		this.pool = pool;
		this.state = state;
		this.tradeSize = tradeSize;
	}

	async getAmountOutMax(
		exchange: string,
		protocol: string,
		feeTier: number,
		tradeSize: BigNumber,
		sqrtPriceLimitX96: BigNumber
	): Promise<BigNumber> {
		console.log("v3Quote: ", uniswapQuoter[exchange])
		// console.log("checking amountOut on ", protocol, " for tradeSize : ", fu(tradeSize, this.pool.token0.decimals))
		// const quoter = new ethers.Contract((protocol == 'UNI' ? uniswapQuoter.UNI : uniswapQuoter.QUICKV3), UniswapV3Quoter, signer);//TESTING ONLY
		if (protocol === "UNIV3") {

			const quoter = new ethers.Contract(uniswapQuoter[exchange], IUniswapV3Quoter, signer);
			const getAmountOutMax = quoter.quoteExactInputSingle(
				this.pool.token0,
				this.pool.token1,
				feeTier,
				this.tradeSize,
				0,// this.state.sqrtPriceX96,
			);
			return getAmountOutMax;
		}
		if (protocol === "ALG") {
			console.log("v3Quote: ", uniswapQuoter[exchange])
			const quoter = new ethers.Contract(algebraQuoter[exchange], AlgebraQuoter, signer);
			const getAmountOutMax = quoter.quoteExactInputSingle(
				this.pool.token0,
				this.pool.token1,
				tradeSize,
				0,
			);
			return getAmountOutMax;
		} else {
			console.log("No protocol specified in V3Quote")
			return BigNumber.from(0);
		}
	};




	// Returns the amount in required to receive the given exact output amount
	// 	function quoteExactOutputSingle(
	// 		address tokenIn,
	// 		address tokenOut,
	// 		uint24 fee,
	// 		uint256 amountOut,
	// 		uint160 sqrtPriceLimitX96
	// 	) external returns(uint256 amountIn)
	async getAmountInMin(
		exchange: string,
		protocol: string,
		feeTier: number,
		amountOutExpected: BigNumber,
		sqrtPriceLimitX96: BigNumber
	): Promise<BigNumber> {
		console.log("v3Quote: ", uniswapQuoter[exchange])
		// const quoter = new ethers.Contract((protocol == 'UNI' ? uniswapQuoter.UNI : uniswapQuoter.QUICKV3), UniswapV3Quoter, signer);//TESTING ONLY
		if (protocol === "UNIV3") {
			const quoter = new ethers.Contract(uniswapQuoter[exchange], IUniswapV3Quoter, signer);
			const getAmountInMin = quoter.quoteExactOutputSingle(
				this.pool.token0,
				this.pool.token1,
				feeTier,
				amountOutExpected,
				this.state.sqrtPriceX96,
			);
			return getAmountInMin;
		}
		if (protocol === "ALG") {
			const quoter = new ethers.Contract(algebraQuoter[protocol], AlgebraQuoter, signer);
			const getAmountInMin = quoter.quoteExactOutputSingle(
				this.pool.token0,
				this.pool.pool1,
				amountOutExpected,
				0,
			)
			return getAmountInMin;
		} else {
			console.log("No protocol specified in V3Quote")
			return BigNumber.from(0);
		}
	}
}