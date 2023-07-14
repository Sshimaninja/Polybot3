import { ethers, BigNumber } from 'ethers';

async function calculateOptimalTradeAmount(
    // pairContract: ethers.Contract, 
    reserveIn: BigNumber,
    reserveOut: BigNumber,
    tokenIndec: number,
    // tokenOutdec: number,
    amountIn: BigNumber
): Promise<ethers.BigNumber> {

    let tradeAmount = ethers.utils.parseUnits('0.01', tokenIndec); // Starting with a small trade amount

    let priceImpact = ethers.constants.MaxUint256; // Set an initial high value for price impact
    let optimalTradeAmount = ethers.constants.Zero;

    while (tradeAmount.lte(amountIn)) {
        const finalReserve = reserveOut.add(tradeAmount);
        const impact = reserveOut.mul(finalReserve).div((reserveIn.add(tradeAmount))).sub(reserveOut);
        if (impact.lt(priceImpact)) {
            priceImpact = impact;
            optimalTradeAmount = tradeAmount;
        }
        tradeAmount = tradeAmount.mul(2); // Increase the trade amount exponentially
    }

    return optimalTradeAmount;
}

// // Usage example
// async function main() {
//     const provider = new ethers.providers.InfuraProvider('mainnet');
//     const pairAddress = '0x123456789...'; // Replace with your Uniswap v2 pair address
//     const pairContract = new ethers.Contract(pairAddress, ['function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'], provider);

//     const amountIn = ethers.utils.parseUnits('1000', 18); // Replace with your desired trade size

//     const optimalTradeAmount = await calculateOptimalTradeAmount(pairContract, amountIn);

//     console.log(`Optimal Trade Amount: ${ethers.utils.formatUnits(optimalTradeAmount, 18)}`);
// }

// main().catch(console.error);