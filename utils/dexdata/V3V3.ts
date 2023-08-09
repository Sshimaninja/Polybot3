import pairdata from '../subgraph/pairs.json';
import { deployedMap, uniswapV3Factory, uniswapRouter } from '../../constants/addresses';

export async function COMPARE() {

    const arbv3v3 = Object.values(pairdata.matches.V3.UNIV3QUICKV3).map(async (data: any) => {
        // console.log(data)
        const ticker = data.ticker;
        const token0 = data.token0;
        const token1 = data.token1;
        const token0dec = Number(data.dec0);
        const token1dec = Number(data.dec1);
        // const v3poolA = data.sushiv3poolID;
        // const v3poolB = data.quickv3poolID;
        const v3poolA = data.univ3poolID;
        const v3poolB = data.quickv3poolID;
        const routerA = uniswapRouter.UNI;
        const routerB = uniswapRouter.QUICKV3;
        const factoryA = uniswapV3Factory.UNI;
        const factoryB = uniswapV3Factory.QUICKV3;
        const feeTierA = data.unifeeTier;
        const feeTierB = data.quickfeeTier;
        // const TVLSUSHI = data.reserveUSD;
        // const TVLQUICK = data.TVLUSD;
        const token0symbol = data.token0symbol;
        const token1symbol = data.token1symbol;
        const flash = deployedMap.flashOne
        //TODO: Make a react front end to display this data. Get Copilot to help with this.
        //Update resume with node.js and react.js
        const constants = {
            ticker: ticker,
            token0symbol: token0symbol,
            token1symbol: token1symbol,
            token0: token0,
            token1: token1,
            token0decimals: token0dec,
            token1decimals: token1dec,
        };

        const v3a = {
            poolID: v3poolA,
            feeTier: feeTierA,
            factory: factoryA,
            // router: routerA,
            // Price1: data.sushiprice1,
        };

        const v3b = {
            poolID: v3poolB,
            feeTier: feeTierB,
            factory: factoryB,
            // router: routerB,
            // Price1: data.quickprice1,
        };

        //// Optionally determine direction by difference percentage. Not recommended as this is done faster when sorting in the front end.

        // let v3a1 = Number(v3a.Price1)//(ex DAI 8.3333333333333333333333333333333e-4/1)
        // let v3b1 = Number(v3b.Price1)
        // let bigger = Math.max(v3a1, v3b1)// tokenOut
        // let avg = (v3a1 + v3b1) / 2
        // let diff = (bigger == v3a1 ? v3a1 - v3b1 : v3b1 - v3a1) //ex: 1010 - 1000 = 10
        // let diffPercent = (diff / avg) * 100 //ex: (10 / 1000) * 100 = .10 * 100 = 10%

        // async function direction() {//update other pricing bots with this logic 
        //   if (bigger == v3b1) {
        //     return {
        //       direction: "flashB",
        //       exchangeA: "SUSHI",
        //       exchangeB: "QUICK",
        //       loanPool: v3poolA,
        //       loanFactory: factoryA,
        //       loanRouter: routerA,
        //       recipient: v3poolB,
        //       recipientRouter: routerB,
        //       token0: token0,
        //       token1: token1,
        //       FLASHCONTRACTDEPLOYED: flash

        //     }
        //   } else {
        //     return {
        //       direction: 'flashA',
        //       exchangeA: "QUICK",
        //       exchangeB: "SUSHI",
        //       loanPool: v3poolB,
        //       loanFactory: factoryB,
        //       loanRouter: routerB,
        //       recipient: v3poolA,
        //       recipientRouter: routerA,
        //       token0: token0,
        //       token1: token1,
        //     }
        //   }
        // }
        const matches = {
            pool: constants,
            UNIv3: v3a,
            QUICKv3: v3b,
            // QUICKV3: v3a,
            // UNIV3: v3b,
            // diffPercent: diffPercent,
            // direction: await direction()
        };
        // console.log(matches); //DEBUG
        return matches;

    });




    return Promise.all(arbv3v3);
};
COMPARE().catch((err) => {
    console.log(err);
    return
});

