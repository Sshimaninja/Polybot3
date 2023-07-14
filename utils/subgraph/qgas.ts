import axios from 'axios'
import fs from 'fs'
export async function qquick() {
    const quickData = async () => {
        var result;
        try {
            result = await axios.post(
                'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap-v3',
                {
                    query:
                        `
                            {
                                    pools(where: {token0_: {symbol: "WMATIC"}, token1_: {}}) {
                                    id
                                    token0Price
                                    token1Price
                                    token0 {
                                    id
                                    symbol
                                    }
                                    token1 {
                                    id
                                    symbol
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
            const quickpairs = (result.data.data.pools);
            console.log(quickpairs)
            fs.writeFile('./utils/subgraph/uni.json', JSON.stringify(quickpairs, null, 4), err => {
                if (err) {
                    console.error(err);
                }
                console.log("uni.json File has been created");
            })
            return quickpairs;
        }
    }
    return quickData();
}
qquick();
