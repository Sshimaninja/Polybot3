import axios from 'axios'
import * as fs from 'fs';
export async function qquickv2() {
  const quickData = async () => {
    var result;
    try {
      result = await axios.post(
        'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06',
        {
          query:
            `
           {
            pairs(
              first: 1000
              orderBy: volumeUSD
              orderDirection: desc
              where: {reserveUSD_gt: "1000"}
            ) {
              id
              token0 {
                symbol
                id
                decimals      
                totalLiquidity
              }
              token1 {
                symbol
                id
                decimals
                totalLiquidity
              }
              token0Price
              token1Price
              reserveUSD
            }
          }
          `
        }
      );
    } catch (error) {
      console.error(error);
    }
    if (result !== undefined) {
      const quickpairs = (result.data.data.pairs);
      // console.log(quickpairs)
      fs.writeFile('./utils/subgraph/quickv2.json', JSON.stringify(quickpairs, null, 4), err => {
        if (err) {
          console.error(err);
        }
        console.log("quickv2.json File has been created");
      })
      return quickpairs;
    }
  }
  return quickData();
}
qquickv2();
