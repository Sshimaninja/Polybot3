import { abi as IERC20 } from "@openzeppelin/contracts/build/contracts/IERC20.json";
import { abi as IUniswapV2Router } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import { uniswapV2Router } from "../constants/addresses";
import hre from 'hardhat';
import { ethers, getSigner } from "ethers";
import { BigNumber } from "ethers";
import { MockWMATIC } from "../typechain-types";

async function main() {
	// Addresses of WMATIC and USDC on mainnet
	// THIS IS A MOCK WMATIC CONTRACT SINCE YOU CAN'T MINT ON REAL WMATIC MAINNET

	const impersonatedAccount = "0x364d6D0333432C3Ac016Ca832fb8594A8cE43Ca6";
	await hre.network.provider.request({
		method: "hardhat_impersonateAccount",
		params: [impersonatedAccount],
	});
	const signer = await ethers.getSigner(impersonatedAccount);

	// Rest of your code...
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});