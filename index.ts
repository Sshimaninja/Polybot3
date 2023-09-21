import { control } from './scripts/swap';
import { provider } from './constants/contract'
import { getGasData } from './scripts/modules/getPolygonGasPrices';
import fs from 'fs'
import path from 'path';
import { FactoryPair } from './constants/interfaces';
import { logger } from './constants/contract';

async function main() {
    //full path to matches dataDir : '/mnt/d/code/arbitrage/polybot-live/polybotv3/data/matches/v2/'
    let matchDir = path.join(__dirname, '/data/matches/v2/');
    async function dataFeed() {
        const pairList: FactoryPair[] = [];
        const files = await fs.promises.readdir(matchDir);
        // for (const file of files) {
        files.forEach(async file => {
            const filePath = path.join(matchDir, file);
            const data = await fs.promises.readFile(filePath, 'utf8');
            const pairs = JSON.parse(data);
            pairList.push(pairs);
        });
        return pairList;
    }

    const pairList = await dataFeed();

    console.log("V2 match lists: ", pairList.length)

    provider.on('block', async (blockNumber: any) => {
        logger.info("New block received: Block # " + blockNumber);
        try {
            const gasData = await getGasData();
            await Promise.all(pairList.map(async (pairList: any) => {
                await control(pairList, gasData);
            }));
        } catch (error: any) {
            logger.error("PROVIDER ERROR: " + error.message);
            return;
        }
    });
}

main().catch((error) => {
    logger.error("MAIN ERROR: " + error.message);
    return;
});