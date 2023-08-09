import { AllV2PairsModule } from './allv2PairsModule';
import { uniswapV2Factory } from '../../constants/addresses';

export async function makePairModule() {
    const allPairs = new AllV2PairsModule(uniswapV2Factory);
    const pairs = await allPairs.getPairs();
    console.log('Pairs: ' + pairs.length);
    console.log(pairs);
}
makePairModule();