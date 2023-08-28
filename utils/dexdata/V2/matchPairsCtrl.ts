import { PoolMatcher } from './matchPairs';

export async function makePairModule() {
    const dataDir = '/mnt/d/code/arbitrage/polybot-live/polybotv3/data/validPairs/v2';
    const matchesDir = '/mnt/d/code/arbitrage/polybot-live/polybotv3/data/matches/v2';
    const allMatches = new PoolMatcher(dataDir, matchesDir);
    const matches = await allMatches.matchPairs();
    // console.log(matches)
}
makePairModule();