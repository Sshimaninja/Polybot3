import { control } from "./scripts/v3/control";
import { provider } from ".//constants/provider";
import { getGasData } from "./scripts/modules/getPolygonGasPrices";
import fs from "fs";
import path from "path";
import { FactoryPair } from "./constants/interfaces";
import { logger } from "./constants/logger";
// import { telegramInfo } from "./scripts/v2/modules/transaction/notify";
// import { fetchGasPriceOnce } from "./scripts/v2/modules/transaction/fetchGasPriceOnce";
export let blockGas = false;
async function main() {
	const message = `Polybot V3 Started: ${Date.now()}`;
	// await telegramInfo(message);
	let matchDir = path.join(__dirname, "./data/matches/v3/");
	async function dataFeed() {
		const pairList: FactoryPair[] = [];
		const files = await fs.promises.readdir(matchDir);
		// for (const file of files) {
		files.forEach(async (file) => {
			const filePath = path.join(matchDir, file);
			const data = await fs.promises.readFile(filePath, "utf8");
			try {
				const pairs = JSON.parse(data);
				pairList.push(pairs);
			} catch (error) {
				console.error(`Error parsing file ${filePath}:`, error);
				console.error("Data:", data);
			}
		});
		// console.log(pairList)
		return pairList;
	}

	const pairList = await dataFeed();
	provider.on("block", async (blockNumber: any) => {
		if (blockNumber === null || undefined) return;

		console.log("New block received: Block # " + blockNumber);
		try {
			let gasData = await getGasData();
			// gasData = await fetchGasPriceOnce(gasData);
			// return;
			await Promise.all(
				pairList.map(async (pairList: any) => {
					await control(pairList, gasData);
					// console.log("Pairlist loop complete. New loop starting...");
				}),
			);
		} catch (error: any) {
			if (error.code === "ECONNRESET") {
				console.log(
					"PROVIDER ERROR: ECONNRESET: Connection reset by peer. Retrying.",
				);
			} else {
				//Verbose:
				logger.error(`PROVIDER ERROR: ${error.stack}`);
				//Concise:
				// logger.error("PROVIDER ERROR: " + error.message);
				// return
			}
		}
	});
}

main().catch((error) => {
	logger.error(`MAIN ERROR:  ${error.stack}`);
	return;
});
