import { ethers, run, network } from "hardhat";
require('dotenv').config();
import { signer, flashwallet } from '../constants/contract'

// npx hardhat run --network localhost scripts/deployFlashDirectTest.ts
// npx hardhat run --network localhost scripts/deployFlashDirectTest.ts; npx hardhat run --network localhost scripts/deployFlashMultiTest.ts

async function main() {
	try {
		const deployer = signer;
		const owner = flashwallet;

		console.log("Deploying contracts with the account: " + deployer.address);

		console.log("Account balance:", (await deployer.getBalance()).toString());

		const flashDirectTest = await ethers.getContractFactory(
			'flashDirectTest'
		);
		console.log('Deploying flashDirectTest to ' + network.name + '...')
		const flashdirecttest = await flashDirectTest.deploy(owner);
		console.log("awaiting flashDirectTest.deployed()...")
		await flashdirecttest.deployed();
		console.log("Contract 'flashDirectTest' deployed: " + flashdirecttest.address);

		// if ((network.config.chainId === 137 && process.env.POLYGONSCAN_APIKEY) || (network.config.chainId === 80001 && process.env.MUMBAISCAN_API_KEY)) {
		// 	await flashdirecttest.deployTransaction.wait(12);
		// 	// verify(flashdirecttest.address, [owner]);

		// } else if (network.config.chainId === 31337) {
		// 	console.log("Verification failed: Network is Hardhat");
		// }

		const checkOwner = await flashdirecttest.checkOwner();
		console.log(checkOwner)

	} catch (error: any) {
		console.log(error.message);
	}

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
};
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
