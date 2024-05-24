import { dataLength, ethers } from "ethers";
import { Bool3Trade } from "../../../constants/interfaces";
import { tradeComparator } from "@cryptoalgebra/integral-sdk";
import { pu } from "../../modules/convertBN";

// import { BigNumber as BN } from 'bignumber.js'

//Safety checks which should be called on target pool before trade.

export async function importantSafetyChecks(trade: Bool3Trade): Promise<boolean> {
	// const swap: swap = {
	//     amount0Out: trade.tradeSizes.loanPool.tradeSizeTokenIn.size,
	//     amount1Out: 0n,
	//     to: await trade.target.pool.getAddress(),
	//     data: "none",
	// };
	if (trade.type.includes("flash")) {
		if (trade.target.tradeSize > trade.loanPool.state.reserves0) {
			trade.type =
				"filtered flash: trade.tradeSizes.loanPool.tradeSizeTokenIn.size > trade.target.reserveIn";
			return false;
		}
		if (trade.target.amountOut > trade.target.state.reserves1) {
			trade.type = "filteredflash: trade.quotes.target.tokenOutOut > trade.target.reserveOut";
			return false;
		}
		//if (trade.k.uniswapKPositive === false) {
		//	trade.type = "filtered flash: K";
		//	return false;
		//}
		// function safeTransferFrom(address token, address from, address to, uint value) internal {
		//     // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
		//     (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
		//     require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
		// }
	}
	//if (trade.type === "direct") {
	//	if (trade.target.tradeSize > trade.wallet.tokenInBalance) {
	//		trade.type =
	//			"filtered single: trade.tradeSizes.loanPool.tradeSizeTokenIn.size > trade.wallet.tokenInBalance";
	//		return false;
	//	}
	//	if (trade.target.amountOut > (trade.loanPool.state.reserves0)) {
	//		trade.type =
	//			"filtered single: trade.quotes.target.tokenOutOut > trade.target.reserveOut";
	//		return false;
	//	}
	//}
	return true;
}
