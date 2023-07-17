import { qsushiv2 } from './qsushiv2'
import { qquickv2 } from './qquickv2'
import { qquickv3 } from './qquickv3'
import { quniv3 } from './quniv3'
import { getFee } from './getGas'
// import sushidata from './sushiv2.json'
// import quickdata from './quickv2.json'
import fs from 'fs';
const sushiv2pairs = [] as any;
const quickv2pairs = [] as any;
const quickv3pairs = [] as any;
const univ3pairs = [] as any;
const interval = 100 * 200 * 2000;
async function checksushiv2() {
    // const sushiv2Data = sushiv2data.data.pairs;
    const sushiv2Data = await qsushiv2();
    sushiv2Data.forEach(async (
        pair: any) => {
        var sushiv2Result = {
            "ticker": pair.token0.symbol + "/" + pair.token1.symbol,
            "token0symbol": pair.token0.symbol,
            "token1symbol": pair.token1.symbol,
            "pairID": pair.token0.id + pair.token1.id,
            "token0": pair.token0.id,
            "dec0": pair.token0.decimals,
            "token1": pair.token1.id,
            "dec1": pair.token1.decimals,
            "sushiv2poolID": pair.id,
            "sushiv2price0": pair.token0Price,
            "sushiv2price1": pair.token1Price,
            // "reserves0sushiv2": pair.token0.liquidity,
            // "reserves1sushiv2": pair.token1.liquidity,
        };
        sushiv2pairs.push(sushiv2Result);
        return sushiv2pairs;
    });
    // console.log(sushiv2pairs);
    return sushiv2pairs;
};
async function checkquickv2() {
    // const quickv2Data = quickv2data.data.pairs;
    const quickv2Data = await qquickv2();
    quickv2Data.forEach(async (
        pair: any) => {
        var quickv2Result = {
            "ticker": pair.token0.symbol + "/" + pair.token1.symbol,
            "token0symbol": pair.token0.symbol,
            "token1symbol": pair.token1.symbol,
            "pairID": pair.token0.id + pair.token1.id,
            "token0": pair.token0.id,
            "dec0": pair.token0.decimals,
            "token1": pair.token1.id,
            "dec1": pair.token1.decimals,
            "quickv2poolID": pair.id,
            "quickv2price0": pair.token0Price,
            "quickv2price1": pair.token1Price,
            // "reserves0quickv2": pair.token0.liquidity,
            // "reserves1quickv2": pair.token1.liquidity,
        };
        quickv2pairs.push(quickv2Result);
        return quickv2pairs;
    });
    // console.log(quickv2pairs);
    return quickv2pairs;
};
async function checkquickv3() {
    const quickv3Data = await qquickv3();
    quickv3Data.forEach(async (pair: any) => {
        var quickv3Result = {
            "ticker": pair.token0.symbol + "/" + pair.token1.symbol,
            "token0symbol": pair.token0.symbol,
            "token1symbol": pair.token1.symbol,
            "pairID": pair.token0.id + pair.token1.id,
            "token0": pair.token0.id,
            "dec0": pair.token0.decimals,
            "token1": pair.token1.id,
            "dec1": pair.token1.decimals,
            "quickv3poolID": pair.id,
            "quickfeeTier": pair.fee,
        };
        quickv3pairs.push(quickv3Result);
        // console.log(quickv3Result['quickfeeTier'])
        return quickv3pairs;
    });
    return quickv3pairs;
};

async function checkuniv3() {
    const univ3Data = await quniv3();
    univ3Data.forEach(async (pair: any) => {
        var univ3Result = {
            "ticker": pair.token0.symbol + "/" + pair.token1.symbol,
            "token0symbol": pair.token0.symbol,
            "token1symbol": pair.token1.symbol,
            "pairID": pair.token0.id + pair.token1.id,
            "token0": pair.token0.id,
            "dec0": pair.token0.decimals,
            "token1": pair.token1.id,
            "dec1": pair.token1.decimals,
            "univ3poolID": pair.id,
            "unifeeTier": pair.feeTier,
        };
        univ3pairs.push(univ3Result);
        // console.log(univ3Result['unifeeTier'])
        return univ3pairs;
    });
    return univ3pairs;
};

export async function match() {
    var sushiv2Data = await checksushiv2();
    var quickv2Data = await checkquickv2();
    var quickv3Data = await checkquickv3();
    var univ3Data = await checkuniv3();

    const sushiquickv2filter = (pairSv2: { pairID: any; }) => quickv2Data.find((pairQv2: { pairID: any; }) => pairQv2.pairID === pairSv2.pairID);

    const quickuniv3filter = (pairQv3: { pairID: any; }) => {
        let pairUv3 = univ3Data.find((pairUv3: { pairID: any; }) => pairUv3.pairID === pairQv3.pairID);
        return pairUv3 ? Object.assign(pairQv3, Object.fromEntries(Object.entries(pairUv3).filter(([key, value]) => !(key in pairQv3)))) : false;
    };

    const unisushiv3v2filter = (pairUv3: { pairID: any; }) => univ3Data.find((pairSv2: { pairID: any; }) => pairSv2.pairID === pairUv3.pairID);

    const uniquickv3v2filter = (pairUv3: { pairID: any; }) => univ3Data.find((pairQv2: { pairID: any; }) => pairQv2.pairID === pairUv3.pairID);

    const sushiquickv2 = sushiv2Data.filter((pairSv2: any) => {
        let pairQv2 = sushiquickv2filter(pairSv2);
        return pairQv2 ? Object.assign(pairSv2, pairQv2) : false;
    })
    const quickuniv3 = quickv3Data.filter((pairQv3: any) => {
        let pairUv3 = quickuniv3filter(pairQv3);
        return pairUv3 ? Object.assign(pairUv3, pairQv3) : false;
    })
    const univ3sushiv2 = univ3Data.filter((pairUv3: any) => {
        let pairSv2 = unisushiv3v2filter(pairUv3);
        return pairSv2 ? Object.assign(pairUv3, pairSv2) : false;
    })
    const univ3quick2 = univ3Data.filter((pairUv3: any) => {
        let pairQv2 = uniquickv3v2filter(pairUv3);
        return pairQv2 ? Object.assign(pairUv3, pairQv2) : false;
    })

    const allMatches = {
        matches: {
            V2: { "SUSHIV2QUICKV2": sushiquickv2, },
            V3: { "UNIV3QUICKV3": quickuniv3, },
            V3V2: {
                "UNIV3SUSHIV2": univ3sushiv2,
                "UNIV3QUICKV2": univ3quick2,
            },
        }
    };
    fs.writeFile('./utils/subgraph/pairs.json', JSON.stringify(allMatches, null, 4), err => {
        if (err) {
            console.error(err);
        }
        console.log('All pairlists updated.')
    })
    setInterval(match, interval);
};
match();