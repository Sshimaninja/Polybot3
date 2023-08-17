import { PairMatcher } from './V2/matchPairs';

export async function makePairModule() {
    const dataDir = '/mnt/d/code/arbitrage/polybot-live/polybotv3v3/data/validPairs';
    const allMatches = new PairMatcher(dataDir);
    const matches = await allMatches.matchPairs();
}
makePairModule();