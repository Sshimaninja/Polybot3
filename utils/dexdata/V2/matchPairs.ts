import fs from 'fs';
import path from 'path';
import { Pair, Pool } from '../../../constants/interfaces';
import { FactoryPool } from '../../../constants/interfaces';
import { FactoryPair } from '../../../constants/interfaces';


export class PoolMatcher {
    private dataDir: string;
    private matchesDir: string;
    private pairs: FactoryPool[];

    constructor(dataDir: string, matchesDir: string) {
        this.dataDir = dataDir;
        this.matchesDir = matchesDir;
        this.pairs = [];
    }
    async matchPairs() {
        const files = fs.readdirSync(this.dataDir);
        // filter by json files
        const jsonFiles = files.filter((file) => path.extname(file) === '.json');

        const factoryPairs: FactoryPair[] = [];

        for (let i = 0; i < jsonFiles.length; i++) {
            const fileA = jsonFiles[i];
            const dataA = require(path.join(this.dataDir, fileA));
            const factoryPoolA = dataA[0] as FactoryPool;
            for (let j = i + 1; j < jsonFiles.length; j++) {
                const fileB = jsonFiles[j];
                const dataB = await require(path.join(this.dataDir, fileB));
                const factoryPoolB = dataB[0] as FactoryPool;

                const matchingPairs: Pair[] = [];
                for (const poolA of factoryPoolA.pairs) {
                    const poolB = factoryPoolB.pairs.find((poolB: Pool) => {
                        return poolA.token0.id === poolB.token0.id;
                    });
                    if (poolB !== undefined) {
                        const pair: Pair = {
                            ticker: `${poolA.token0.symbol}/${poolA.token1.symbol}`,
                            poolA_id: poolA.poolID,
                            poolB_id: poolB.poolID,
                            token0: poolA.token0,
                            token1: poolA.token1,
                        };
                        matchingPairs.push(pair);
                    }
                }

                if (matchingPairs.length > 0) {
                    console.log(`Found ${matchingPairs.length} matching pairs between ${factoryPoolA.exchange} and ${factoryPoolB.exchange}`);
                    const outputFile = path.join(this.matchesDir, `${fileA.split('.')[0]}${fileB.split('.')[0]}.json`);
                    factoryPairs.push({
                        exchangeA: factoryPoolA.exchange,
                        factoryA_id: factoryPoolA.factoryID,
                        routerA_id: factoryPoolA.routerID,
                        exchangeB: factoryPoolB.exchange,
                        factoryB_id: factoryPoolB.factoryID,
                        routerB_id: factoryPoolB.routerID,
                        matches: matchingPairs,
                    });
                    fs.writeFile(outputFile, JSON.stringify(factoryPairs, null, 2), function (err) {
                        if (err) return console.log(err);
                        console.log(`Matching pairs written to ${outputFile}`);
                    });
                } else {
                    console.log(`No matching pairs found between ${factoryPoolA.factoryID} and ${factoryPoolB.factoryID}`);
                }
            }
        }
    }
}