import { ethers, run, network } from "hardhat";
require('dotenv').config();
import { signer, flashwallet } from '../../constants/contract'

// npx hardhat run--network polygon scripts/deployFlashMulti.ts

async function main() {
	try {
		const deployer = signer;
		const owner = flashwallet;

		console.log("Deploying contracts with the account: " + deployer.address);

		console.log("Account balance:", (await deployer.getBalance()).toString());

		const flashMulti = await ethers.getContractFactory(
			'flashMulti'
		);
		console.log('Deploying flashMulti to ' + network.name + '...')
		const flashmulti = await flashMulti.deploy(owner, {
			gasPrice: ethers.utils.parseUnits("300", "gwei")
		});
		console.log("awaiting flashMulti.deployed()...")

		await flashmulti.deployed();
		console.log("Contract 'flashMulti' deployed: " + flashmulti.address);

		if ((network.config.chainId === 137 && process.env.POLYGONSCAN_APIKEY) || (network.config.chainId === 80001 && process.env.MUMBAISCAN_API_KEY)) {
			await flashmulti.deployTransaction.wait(12);
			// verify(flashmulti.address, [owner]);

		} else if (network.config.chainId === 31337) {
			console.log("Verification failed: Network is Hardhat");
		} else {
			const checkOwner = await flashmulti.checkOwner();
			console.log(checkOwner)
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
	} catch (error: any) {
		console.log(error.message);
	}
}
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
})