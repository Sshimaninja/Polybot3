import { PairMatcher } from './matchPairs';
import path from 'path';

export async function makePairModule() {
    const dataDir = '../../data/validPairs/'
    const allMatches = new PairMatcher(dataDir);
    const matches = await allMatches.matchPairs();
}
makePairModule();