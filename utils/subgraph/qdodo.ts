import axios from 'axios'
import fs from 'fs'
export async function qdodo() {
    const dodoData = async () => {
        var result;
        try {
            result = await axios.post(
                'https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-polygon',
                {
                    query: `
                            {
                            pairs {
                                baseToken {
                                id
                                symbol
                                totalSupply
                                }
                                quoteToken {
                                id
                                symbol
                                totalSupply
                                }
                                id                            
                            }                            
                        `
                }
            );
        } catch (error: any) {
            console.error(error);
            if (error.message.includes('Cannot read properties of undefined (reading')) {
                console.log('Retrying...\nIf error persists, check query syntax.');
                await dodoData();
            }
        }
        if (result !== undefined) {
            const dodopairs = result.data.data.pairs;
            fs.writeFile('./utils/subgraph/dodo.json', JSON.stringify(dodopairs, null, 4), err => {
                if (err) {
                    console.error(err);
                }
                console.log("dodo.json File has been created");
            })
            // console.log(dodopairs)
            return dodopairs;
        }
    }
    return dodoData();
}
qdodo();
