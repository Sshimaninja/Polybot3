import { control } from './scripts/swap';
import { provider } from './constants/contract'
import fs from 'fs'
import path from 'path';
import { FactoryPair } from './constants/interfaces';
async function main() {
    //full path to matches dataDir : '/mnt/d/code/arbitrage/polybot-live/polybotv3/data/matches/v2/'
    let matchDir = path.join(__dirname, '/data/matches/v2/');
    // console.log(matchDir)
    async function dataFeed() {
        const pairList: FactoryPair[] = [];
        const files = await fs.promises.readdir(matchDir);
        for (const file of files) {
            const filePath = path.join(matchDir, file);
            const data = await fs.promises.readFile(filePath, 'utf8');
            const pairs = JSON.parse(data);
            pairList.push(pairs);
        }
        // console.log(pairList)
        return pairList;
    }
    const pairList = await dataFeed();
    try {
        provider.on('block', async (blockNumber: any) => {
            console.log('New block received:::::::::::::::::: Block # ' + blockNumber + ":::::::::::::::")
            control(pairList);
        });
    } catch (error: any) {
        console.log("PROVIDER ERROR:::::::::::::::::::::: " + error.message);
        return
    }
}
main().catch((error) => {
    console.error(error);
    console.log("MAIN ERROR:::::::::::::::::::::: " + error.message);
    return
})

