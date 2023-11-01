import { ethers } from "hardhat";
import hre from 'hardhat'
import { abi as IERC20 } from "@openzeppelin/contracts/build/contracts/IERC20.json";
import { abi as IUniswapV2Router } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json"
import { uniswapV2Router } from "../constants/addresses";

import { fu } from "../scripts/v2/modules/convertBN";

import { BigNumber } from "ethers";
import { MockWMATIC } from "../typechain-types";

async function arbSim() {
	// Addresses of WMATIC and USDC on mainnet
	// THIS IS A MOCK WMATIC CONTRACT SINCE YOU CAN'T MINT ON REAL WMATIC MAINNET

	// const impersonatedAccount = "0xadbF1854e5883eB8aa7BAf50705338739e558E5b";
	// await hre.network.provider.request({
	// 	method: "hardhat_impersonateAccount",
	// 	params: [impersonatedAccount],
	// });
	// const signer = await ethers.getSigner(impersonatedAccount);

	// Define the ABI for the WMATIC contract
	const WMATIC_ABI = [
		"function deposit() public payable",
		"function withdraw(uint wad) public",
		"function balanceOf(address account) external view returns (uint256)",
	];
	const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

	const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)
	console.log(signer.address)

	const matic = new ethers.Contract("0x0000000000000000000000000000000000001010", IERC20, signer);
	const wmatic = new ethers.Contract("0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", WMATIC_ABI, signer);
	const usdc = new ethers.Contract("0x2791bca1f2de4661ed88a30c99a7a9449aa84174", IERC20, signer);

	const quickRouter = new ethers.Contract(uniswapV2Router.QUICK, IUniswapV2Router, signer);

	// Convert half of MATIC to WMATIC
	const gasBal = await matic.balanceOf(signer.address);
	console.log("Balance of MATIC:: ", fu(gasBal, 18));
	const halfMatic = gasBal.div(2)
	console.log("Half of MATIC:: ", fu(halfMatic, 18));
	console.log("Approving MATIC spend")
	const maticApprove = await matic.approve(wmatic.address, halfMatic, { gasLimit: ethers.utils.hexlify(91000) });
	if (maticApprove) console.log("MATIC>WMATIC APPROVED");
	console.log("Balance of MATIC:: ", fu(await matic.balanceOf(signer.address), 18));
	const wrap = await wmatic.deposit({ value: halfMatic });
	const reciept = await wrap.wait();
	if (reciept) console.log("MATIC WRAPPED");
	console.log("Reciept: ", reciept.transactionHash);
	console.log("Balance of MATIC:: ", fu(await matic.balanceOf(signer.address), 18));
	console.log("Balance of WMATIC: ", fu(await wmatic.balanceOf(signer.address), 18));
	console.log("Balance of USDC::: ", fu(await usdc.balanceOf(signer.address), 6));



	// approve the router to spend WMATIC
	await wmatic.connect(signer).approve(quickRouter.address, ethers.utils.parseEther(halfMatic));

	// Sell a large amount of WMATIC for USDC
	await quickRouter.connect(signer).swapExactTokensForTokens(
		halfMatic, // amountIn
		0, // amountOutMin
		[wmatic.address, usdc.address], // path
		signer.address, // to
		Math.floor(Date.now() / 1000) + 60 * 20 // deadline
	);
	console.log("Balance of MATIC:: ", fu(await wmatic.balanceOf(signer.address), 18));
	console.log("Balance of WMATIC: ", fu(await wmatic.balanceOf(signer.address), 18));
	console.log("Balance of USDC: ", fu(await usdc.balanceOf(signer.address), 6));

}


arbSim()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
/**{
  id: '0x6e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827',
  trade: 'multi',
  ticker: 'WMATIC/USDC',
  direction: 'A',
  tradeSize: '1103.600106991112026744 WMATIC',
  loanPool: {
	exchange: 'SUSHI',
	priceIn: '1.949772772857145064',
	priceOut: '0.512880',
	reservesIn: '257984.708061820163815265 WMATIC',
	reservesOut: '132315.268555 USDC',
	amountRepay: '565.292413 USDC',
	repaysObj: {
	  simpleMulti: '563.603759 USDC',
	  getAmountsOut: '561.920128 USDC',
	  getAmountsIn: '565.292413 USDC'
	}
  },
  target: {
	exchange: 'QUICK',
	priceIn: '1.954566099179981663',
	priceOut: '0.511623',
	reservesIn: '1754846.350465150307485387 WMATIC',
	reservesOut: '897818.882258 USDC',
	amountOut: '562.580031 USDC'
  },
  result: {
	uniswapkPreT: '34135315930283008517330881883492075',
	uniswapkPosT: '34134505727119051606202194183048328',
	uniswapKPositive: false,
	profit: '-2.712382 USDC',
	profperc: '-0.482133%'
  }
}
 */



// Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266(10000 ETH)
// Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
