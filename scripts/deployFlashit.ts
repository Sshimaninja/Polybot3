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

        const Flashit = await ethers.getContractFactory(
            'flashit'
        );
        console.log('Deploying Flashit to' + network.name + '...')
        const flashit = await Flashit.deploy(owner);
        await flashit.deployed();
        console.log("Contract 'Flashit' deployed: " + flashit.address);

        if ((network.config.chainId === 137 && process.env.POLYGONSCAN_APIKEY) || (network.config.chainId === 80001 && process.env.MUMBAISCAN_API_KEY)) {
            await flashit.deployTransaction.wait(12);
            verify(flashit.address, [owner]);

        } else if (network.config.chainId === 31337) {
            console.log("Verification failed: Network is Hardhat");
        }

        const checkOwner = await flashit.checkOwner();
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
