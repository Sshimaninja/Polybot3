import { match } from './utils/subgraph/populate';
import { flashit } from './scripts/flashitv2';
import { provider } from './constants/contract'
async function main() {
    // try {
    //     match();
    // } catch (error: any) {
    //     console.log("MATCHING ERROR:");
    //     console.log(error.message);
    //     return
    // }
    try {
        provider.on('block', async (blockNumber: any) => {
            console.log('New block received:::::::::::::::::: Block # ' + blockNumber + ":::::::::::::::")
            flashit();
        });
    } catch (error: any) {
        console.log("PROVIDER ERROR:::::::::::::::::::::: " + error.message);
        return
    }
}
main().catch((error) => {
    console.error(error);
    console.log("MAIN ERROR:::::::::::::::::::::: " + error.message);
    return
})

