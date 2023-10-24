import { ethers, run, network } from "hardhat";
require('dotenv').config();
import { signer, flashwallet } from '../constants/contract'

// npx hardhat run --network localhost scripts/deployFlashMultiTest.ts
// npx hardhat run --network localhost scripts/deployFlashDirectTestTest.ts; npx hardhat run--network localhost scripts/deployFlashMultiTest.ts
async function main() {
	try {
		const deployer = signer;
		const owner = flashwallet;

		console.log("Deploying contracts with the account: " + deployer.address);

		console.log("Account balance:", (await deployer.getBalance()).toString());

		const flashMultiTest = await ethers.getContractFactory(
			'flashMultiTest'
		);
		console.log('Deploying flashMultiTest to ' + network.name + '...')
		const flashmultitest = await flashMultiTest.deploy(owner);
		console.log("awaiting flashMultiTest.deployed()...")
		await flashmultitest.deployed();
		console.log("Contract 'flashMultiTest' deployed: " + flashmultitest.address);

		// if ((network.config.chainId === 137 && process.env.POLYGONSCAN_APIKEY) || (network.config.chainId === 80001 && process.env.MUMBAISCAN_API_KEY)) {
		// 	await flashmultitest.deployTransaction.wait(12);
		// 	// verify(flashmultitest.address, [owner]);

		// } else if (network.config.chainId === 31337) {
		// 	console.log("Verification failed: Network is Hardhat");
		// } else {
		const checkOwner = await flashmultitest.checkOwner();
		console.log(checkOwner)
		// }
		// async function verify(contractAddress: any, args: any) {
		// 	console.log("Verifying contract: " + contractAddress + "./Please wait...");
		// 	try {
		// 		await run("verify:verify", {
		// 			address: contractAddress,
		// 			constructorArguments: args,
		// 		})
		// 	} catch (error: any) {
		// 		if (error.message.includes("already verified")) {
		// 			console.log("Contract already verified");
		// 		} else {
		// 			console.log("Error: " + error.message);
		// 		}
		// 	};
		// }
	} catch (error: any) {
		console.log(error.message);
	}
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
})