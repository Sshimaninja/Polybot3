
import axios from 'axios'
import * as fs from 'fs';
export async function quniv3() {
  const uniData = async () => {
    var result;
    try {
      result = await axios.post(
        'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon',
        {
          query:
            `
              {
                pools(where: {volumeUSD_gt: "10000"}) {
                  id
                  token0 {
                    id
                    symbol
                    decimals
                    totalValueLockedUSD
                  }
                  token1 {
                    id
                    symbol
                    decimals
                    totalValueLockedUSD
                  }
                  feeTier
                }
              }
          `
        }
      );
    } catch (error) {
      console.error(error);
    }
    if (result !== undefined) {
      const unipools = (result.data.data.pools);
      // console.log(unipools)
      fs.writeFile('./utils/subgraph/univ3.json', JSON.stringify(unipools, null, 4), err => {
        if (err) {
          console.error(err);
        }
        console.log("univ3.json File has been created");
      })
      return unipools;
    }
  }
  return uniData();
}
quniv3();
