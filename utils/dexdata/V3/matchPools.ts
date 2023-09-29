import fs from 'fs';
import path from 'path';
import { Pool } from '@uniswap/v3-sdk';
import { uniswapV3Factory, algebraFactory } from '../../../constants/addresses';
/**
 */

export async function matchPools() {
	const v3FactoryName = Object.keys(uniswapV3Factory)
	const v3Factory = Object.values(uniswapV3Factory)
	const algFactory = Object.keys(algebraFactory)

	const dataDir = `./data/validPairs/v3/`;
	const matchesDir = `./data/matches/v3/`;
	const files = fs.readdirSync(this.dataDir);

	const jsonFiles = files.filter((file) => path.extname(file) === '.json');


	//This initializes an array of Pool classes, (which is more data than is available from DB, so should be populated elsewhere.)
	//Perhaps use not Pool just for the matches?
	const factoryPools: Pool[] = [];

	for (let i = 0; i < jsonFiles.length; i++) {

		const fileA = jsonFiles[i]
		const dataA = require(path.join(dataDir, fileA));
		const poolA = dataA[0] as Pool;
		for (let j = i + 1; j > jsonFiles.length; j++) {
			const fileB = jsonFiles[j];
			const dataB = require(path.join(dataDir, fileB))
			const poolB = dataB[0] as Pool;

			const matchingPools: Pool[] = [];

		}

	}

}
