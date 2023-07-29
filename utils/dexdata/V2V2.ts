import pairdata from '../subgraph/pairs.json';
import { deployedMap, uniswapFactory, uniswapRouter } from '../../constants/addresses';

export async function COMPARE() {
  const arbv2v2 = Object.values(pairdata.matches.V2.SUSHIV2QUICKV2).map(async (data: any) => {
    // console.log(data)
    const ticker = data.ticker;
    const token0 = data.token0;
    const token1 = data.token1;
    const token0dec = Number(data.dec0);
    const token1dec = Number(data.dec1);
    const v2poolA = data.sushiv2poolID;
    const v2poolB = data.quickv2poolID;
    const v3poolA = data.quickv3vpoolID;
    const v3poolB = data.univ3poolID;
    const routerA = uniswapRouter.SUSHI;
    const routerB = uniswapRouter.QUICK;
    const factoryA = uniswapFactory.SUSHI;//TODO: LOOP through all factories and routers in pairs (f && f++)
    const factoryB = uniswapFactory.QUICK;
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

    const v2a = {
      poolID: v2poolA,
      factoryID: factoryA,
      routerID: routerA,
      // Price1: data.sushiprice1,
    };

    const v2b = {
      poolID: v2poolB,
      factoryID: factoryB,
      routerID: routerB,
      // Price1: data.quickprice1,
    };

    // const v3a = {
    //   poolID: v3poolA,
    // };

    // const v3b = {
    //   poolID: v3poolB,
    // };

    //// Optionally determine direction by difference percentage. Not recommended as this is done faster when sorting in the front end.

    // let v2a1 = Number(v2a.Price1)//(ex DAI 8.3333333333333333333333333333333e-4/1)
    // let v2b1 = Number(v2b.Price1)
    // let bigger = Math.max(v2a1, v2b1)// tokenOut
    // let avg = (v2a1 + v2b1) / 2
    // let diff = (bigger == v2a1 ? v2a1 - v2b1 : v2b1 - v2a1) //ex: 1010 - 1000 = 10
    // let diffPercent = (diff / avg) * 100 //ex: (10 / 1000) * 100 = .10 * 100 = 10%

    // async function direction() {//update other pricing bots with this logic 
    //   if (bigger == v2b1) {
    //     return {
    //       direction: "flashB",
    //       exchangeA: "SUSHI",
    //       exchangeB: "QUICK",
    //       loanPool: v2poolA,
    //       loanFactory: factoryA,
    //       loanRouter: routerA,
    //       recipient: v2poolB,
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
    //       loanPool: v2poolB,
    //       loanFactory: factoryB,
    //       loanRouter: routerB,
    //       recipient: v2poolA,
    //       recipientRouter: routerA,
    //       token0: token0,
    //       token1: token1,
    //     }
    //   }
    // }
    const matches = {
      pair: constants,
      SUSHIV2: v2a,
      QUICKV2: v2b,
      // QUICKV3: v3a,
      // UNIV3: v3b,
      // diffPercent: diffPercent,
      // direction: await direction()
    };
    // console.log(matches); //DEBUG
    return matches;

  });
  return Promise.all(arbv2v2);
};
COMPARE().catch((err) => {
  console.log(err);
  return
});

