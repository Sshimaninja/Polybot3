import axios from 'axios'
import * as fs from 'fs';
export async function qsushiv2() {
  const sushiData = async () => {
    var result;
    try {
      result = await axios.post(
        'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange',
        {
          query: `
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
                  liquidity
                  decimals  
                }
                token1 {
                  symbol
                  id 
                  liquidity
                  decimals
                }
                token0Price
                token1Price
                reserveUSD
              }
            }
          `
        }
      );
    } catch (error: any) {
      console.error(error);
      if (error.message.includes('Cannot read properties of undefined (reading')) {
        console.log('Retrying...\nIf error persists, check query syntax.');
        await sushiData();
      }
    }
    if (result !== undefined) {
      const sushitokens = result.data.data.pairs;
      fs.writeFile('./utils/subgraph/sushiv2.json', JSON.stringify(sushitokens, null, 4), err => {
        if (err) {
          console.error(err);
        }
        console.log("sushiv2.json File has been created");
      })
      // console.log(sushitokens)
      return sushitokens;
    }
  }
  return sushiData();
}
qsushiv2();
