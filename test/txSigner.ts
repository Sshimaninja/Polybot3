import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { BigInt } from "ethers";
import { provider } from "../constants/contract";

export async function transferMaticToInitialSigner(initialSigner: Wallet): Promise<BigInt | undefined> {
	const signers = await ethers.getSigners();

	const transactions = signers.slice(1).map(async (signer) => {
		const balance = await signer.getBalance();
		const ninetyFivePercentMatic = balance.mul(95).div(100);

		const gasLimit = await provider.getBlock("latest").then((block) => block.gasLimit.toString());

		if (balance.gt(0)) {
			const transaction = {
				to: initialSigner.address,
				value: ninetyFivePercentMatic,
				gasLimit: gasLimit, // standard gas limit for simple transfers
			};

			const tx = await signer.sendTransaction(transaction);
			await tx.wait();
			console.log(`Transferred ${ethers.utils.formatEther(balance)} MATIC from signer ${signer.address} to initial signer`);
		}
	});

	await Promise.all(transactions);

	return await initialSigner.getBalance();
}