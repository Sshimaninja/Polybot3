import { ethers, run, network } from "hardhat";
require('dotenv').config();
import { provider } from '../constants/contract'

// export const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/SYBkEnqFyPQHdAZr-TnaUVAmTKfvZZe-`)
if (process.env.TEST_KEY === undefined) {
    throw new Error("Private key is not defined");
}
export const wallet = new ethers.Wallet(process.env.TEST_KEY, provider);
export const signer = wallet.connect(provider);

async function main() {
    try {
        const deployer = signer;
        const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

        console.log("Deploying contracts with the account: " + deployer.address);

        console.log("Account balance:", (await deployer.getBalance()).toString());

        const FlashitV2 = await ethers.getContractFactory(
            'flashitV2'
        );
        console.log('Deploying FlashitV2 to' + network.name + '...')
        const flashitV2 = await FlashitV2.deploy(owner);
        await flashitV2.deployed();
        console.log("Contract 'FlashitV2' deployed: " + flashitV2.address);

        if ((network.config.chainId === 137) || (network.config.chainId === 80001)) {
            await flashitV2.deployTransaction.wait(12);
            verify(flashitV2.address, [owner]);
        } else if (network.config.chainId === 31337) {
            console.log("Verification failed: Network is Hardhat");
        }

        const checkOwner = await flashitV2.checkOwner();
        console.log(checkOwner)

    } catch (error: any) {
        console.log(error.message);
    }
};

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
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
