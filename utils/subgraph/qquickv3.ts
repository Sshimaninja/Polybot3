import axios from 'axios'
import * as fs from 'fs';
export async function qquickv3() {
  const quickData = async () => {
    var result;
    try {
      result = await axios.post(
        'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap-v3',
        {
          query:
            `
              {
                pools(
                  where: {volumeUSD_gt: "10000"}) {
                  id
                  fee
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
                }
              }
          `
        }
      );
    } catch (error) {
      console.error(error);
    }
    if (result !== undefined) {
      const quickpools = (result.data.data.pools);
      // console.log(quickpools)
      // return quickpools;
      fs.writeFile('./utils/subgraph/quickv3.json', JSON.stringify(quickpools, null, 4), err => {
        if (err) {
          console.error(err);
        }
        console.log("quickv3.json File has been created");
      })
      return quickpools;
    }
  }
  return quickData();
}
qquickv3();
