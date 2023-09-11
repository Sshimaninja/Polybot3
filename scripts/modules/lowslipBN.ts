import { BigNumber as BN } from "bignumber.js";

export async function getRequiredTokenIn(reserveIn: BN, reserveOut: BN, targetPrice: BN, slippageTolerance: BN): Promise<BN> {
    // Calculate the expected trade size without considering slippage
    const expectedTradeSize = reserveIn.minus(targetPrice.multipliedBy(reserveOut));

    // Calculate the maximum allowed slippage in the trade
    const maxSlippage = expectedTradeSize.multipliedBy(slippageTolerance);

    // Calculate the required tokenIn considering slippage
    const requiredTokenIn = maxSlippage;

    return requiredTokenIn;
}


// async function main() {
//     const loanPoolReservesIn = new BN('2423983.604268487571547835');
//     const loanPoolReservesOut = new BN('781.755288809069338644');
//     const loanPoolPriceOut = new BN('0.000322508488684678');
//     const loanPoolTargetPrice = new BN('0.000322508488684678');
//     const recipientReservesIn = new BN('1527056.518517431821924297');
//     const recipientReservesOut = new BN('492.452464990875230849');
//     const recipientTradeSize = new BN('-1527209.065333301321831524');
//     const slippageTolerance = new BN('0.1');

//     const requiredTokenInForLoanPool = await getRequiredTokenIn(
//         loanPoolReservesIn,
//         loanPoolReservesOut,
//         loanPoolTargetPrice,
//         slippageTolerance
//     );

//     const requiredTokenInForRecipient = await getRequiredTokenIn(
//         recipientReservesIn,
//         recipientReservesOut,
//         loanPoolPriceOut,
//         slippageTolerance
//     );

//     console.log("Required Token In for LoanPool:", requiredTokenInForLoanPool.toString());
//     console.log("Required Token In for Recipient:", requiredTokenInForRecipient.toString());

// }
// main();


// New block received:::::::::::::::::: Block # 47423259:::::::::::::::
// [{
//     ticker: 'WMATIC/DAI',
//     loanPool: {
//         exchange: 'SUSHI',
//         priceIn: '1.985360991372836496',
//         priceOut: '0.503686737245965765',
//         reservesIn: '3990.509538705296998254',
//         reservesOut: '2009.966729499374980796',
//         amountRepay: '29.891766765454845649',
//         amountOut: '35.523024389369096477'
//     },
//     recipient: {
//         exchange: 'QUICK',
//         priceIn: '1.989474363781820944',
//         priceOut: '0.502645330950173874',
//         targetPrice: '0.503686737245965765',
//         reservesIn: '19151.606113404079526688',
//         reservesOut: '9626.465393099366752257',
//         tradeSize: '143.028831683426562465',
//         amountOut: '69.347487273239591823'
//     },
//     result: { loanCostPercent: '0.0', profit: '5.631257623914250828' }
// }]