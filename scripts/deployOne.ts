import { ethers, run, network } from "hardhat";
require('dotenv').config();
import { signer, flashwallet } from '../constants/contract'

//TODO: REWRITE THIS IF NEEDED WITH PATRICK COLLIN'S TUTORIAL
async function main() {
    try {
        const deployer = signer;
        const owner = flashwallet;

        console.log("Deploying contracts with the account: " + deployer.address);

        console.log("Account balance:", (await deployer.getBalance()).toString());

        const flashOne = await ethers.getContractFactory(
            'flashOne'
        );
        console.log('Deploying flashOne to' + network.name + '...')
        const flashone = await flashOne.deploy(owner);
        await flashone.deployed();
        console.log("Contract 'flashOne' deployed: " + flashone.address);

        if ((network.config.chainId === 137 && process.env.POLYGONSCAN_APIKEY) || (network.config.chainId === 80001 && process.env.MUMBAISCAN_API_KEY)) {
            await flashone.deployTransaction.wait(12);
            verify(flashone.address, [owner]);

        } else if (network.config.chainId === 31337) {
            console.log("Verification failed: Network is Hardhat");
        }

        const checkOwner = await flashone.checkOwner();
        console.log(checkOwner)

    } catch (error: any) {
        console.log(error.message);
    }

    async function verify(contractAddress: any, args: any) {
        console.log("Verifying contract: " + contractAddress + "./Please wait...");
        try {
            await run("verify:verify", {
                address: contractAddress,
                constructorArguments: args,
            })
        } catch (error: any) {
            if (error.message.includes("already verified")) {
                console.log("Contract already verified");
            } else {
                console.log("Error: " + error.message);
            }
        };
    }
};
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
