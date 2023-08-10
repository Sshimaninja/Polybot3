import fs from 'fs';
import path from 'path';
import { SmartPair } from '../../scripts/modules/smartPair';
import { BigNumber as BN } from 'bignumber.js';
interface Pair {
    tokenData: {
        ticker: string;
        pair: string;
        token0: {
            symbol: string;
            id: string;
            decimals: number;
        };
        token1: {
            symbol: string;
            id: string;
            decimals: number;
        };
    };
}

interface MatchingPair {
    exchangeA: string;
    exchangeB: string;
    matchingPairs: Pair[];
}

export class PairMatcher {
    private dataDir: string;
    private pairs: MatchingPair[];

    constructor(dataDir: string) {
        this.dataDir = dataDir;
        this.pairs = [];
    }

    async matchPairs() {
        const files = fs.readdirSync(this.dataDir);
        const jsonFiles = files.filter((file) => path.extname(file) === '.json');

        for (let i = 0; i < jsonFiles.length; i++) {
            const file = jsonFiles[i];
            const exchangeA = path.basename(file, '.json');
            const data = require(path.join(this.dataDir, file));
            for (let j = i + 1; j < jsonFiles.length; j++) {
                const otherFile = jsonFiles[j];
                const exchangeB = path.basename(otherFile, '.json');
                const otherData = require(path.join(this.dataDir, otherFile));
                const matchingPairs = data.filter((pair: Pair) => {
                    const otherPair = otherData.find((otherPair: Pair) => {
                        return (
                            pair.tokenData.token0.id === otherPair.tokenData.token0.id &&
                            pair.tokenData.token1.id === otherPair.tokenData.token1.id
                        );
                    });
                    return otherPair !== undefined;
                });
                if (matchingPairs.length > 0) {
                    const smartPairs = matchingPairs.map((pair: any) => {
                        return new SmartPair({ pair, SUSHIV2: { factoryID: exchangeA }, QUICKV2: { factoryID: exchangeB } }, BN(0.01));
                    });
                    const outputFile = path.join(this.dataDir, `${exchangeA}${exchangeB}Matches.json`);
                    fs.writeFile(outputFile, JSON.stringify(smartPairs, null, 2), function (err) {
                        if (err) return console.log(err);
                        console.log(`Matching pairs written to ${outputFile}`);
                    });
                    this.pairs.push({
                        exchangeA,
                        exchangeB,
                        matchingPairs,
                    });
                }
            }
        }
    }
}