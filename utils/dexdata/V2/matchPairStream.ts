// import fs from 'fs';
// import path from 'path';
// import JSONStream from 'jsonstream';
// import { SmartPair } from '../../../scripts/modules/smartPair';
// import { BigNumber as BN } from 'bignumber.js';
// interface Pair {
//     tokenData: {
//         ticker: string;
//         pair: string;
//         token0: {
//             symbol: string;
//             id: string;
//             decimals: number;
//         };
//         token1: {
//             symbol: string;
//             id: string;
//             decimals: number;
//         };
//     };
// }

// interface MatchingPair {
//     exchangeA: string;
//     exchangeB: string;
//     matchingPairs: Pair[];
// }

// export class PairMatcher {
//     private dataDir: string;
//     private matches: MatchingPair[];

//     constructor(dataDir: string) {
//         this.dataDir = dataDir;
//         this.matches = [];
//     }

//     async matchPairs(): Promise<MatchingPair[]> {
//         const files = fs.readdirSync(this.dataDir);
//         //filter by json files
//         const jsonFiles = files.filter((file) => path.extname(file) === '.json');

//         //vastly improve speed by using a forEach loop.
//         for (let i = 0; i < jsonFiles.length; i++) {
//             const fileA = jsonFiles[i];
//             const exchangeA = path.basename(fileA, '.json');
//             const readStreamA = fs.createReadStream(path.join(this.dataDir, fileA), { encoding: 'utf8' });
//             const jsonParserA = JSONStream.parse('*');
//             // const dataA = require(path.join(this.dataDir, fileA));
//             // console.log(dataA)
//             for (let j = i + 1; j < jsonFiles.length; j++) {
//                 const fileB = jsonFiles[j];
//                 const exchangeB = path.basename(fileB, '.json');
//                 const readStreamB = fs.createReadStream(path.join(this.dataDir, fileB), { encoding: 'utf8' });
//                 const jsonParserB = JSONStream.parse('*');
//                 // const dataB = require(path.join(this.dataDir, fileB));
//                 // console.log(dataB)
//                 const matchingPairs = [] as Pair[];
//                 jsonParserA.on('data', (dataA: any) => {
//                     jsonParserB.on('data', (dataB: any) => {
//                         const pairA: Pair = { tokenData: dataA } as Pair; //dataA as Pair;
//                         const pairB: Pair = { tokenData: dataB } as Pair; //dataB as Pair;
//                         console.log(pairA.tokenData.ticker, pairB.tokenData.ticker)
//                         if (
//                             pairA.tokenData.token0?.id === pairB.tokenData.token0?.id &&
//                             pairA.tokenData.token1?.id === pairB.tokenData.token1?.id
//                         ) {
//                             console.log(pairA.tokenData.ticker, pairB.tokenData.ticker)
//                             matchingPairs.push(pairA);
//                         }
//                     });
//                 });

//                 jsonParserB.on('end', () => {
//                     if (matchingPairs.length > 0) {
//                         const smartPairs = matchingPairs.map((pair: any) => {
//                             return new SmartPair(
//                                 {
//                                     pair,
//                                     SUSHIV2: { factoryID: exchangeA },
//                                     QUICKV2: { factoryID: exchangeB }
//                                 },
//                                 BN(0.01)
//                             );
//                         });
//                         const outputFile = path.join(this.dataDir, `${exchangeA}${exchangeB}Matches.json`);
//                         const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });
//                         writeStream.write(JSON.stringify(smartPairs, null, 2));
//                         writeStream.end();
//                         console.log(`Matching pairs written to ${outputFile}`);
//                         this.matches.push({
//                             exchangeA,
//                             exchangeB,
//                             matchingPairs,
//                         });
//                     }
//                 });
//                 // readStreamB.pipe(jsonParserB);
//             }
//             // readStreamA.pipe(jsonParserA);
//         }
//         return this.matches;
//     }
// }