import { BigNumber } from 'ethers';




export async function getAmountsOut(amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
    const amountInWithFee = amountIn.mul(997);
    const numerator = amountInWithFee.mul(reserveOut);
    const denominator = reserveIn.mul(1000).add(amountInWithFee);
    const amountOut = numerator.div(denominator);
    return amountOut;
}

//amountIn = amountOut * reserveIn / (reserveOut - amountOut)
export async function getAmountsIn(amountOut: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber): Promise<BigNumber> {
    const fee = amountOut.mul(BigNumber.from("3")).div(BigNumber.from("1000")); // Calculate the fee (0.3% of the borrowed amount)
    const numerator = reserveIn.mul(amountOut).mul(1000);
    const denominator = reserveOut.sub(amountOut).mul(997);
    const amountIn = numerator.div(denominator).add(1);
    return amountIn;
}

// ///
// const borrowedAmount = utils.parseUnits("100", token0Decimals); // The amount of token0 borrowed from the pool
// const fee = borrowedAmount.mul(BigNumber.from("3")).div(BigNumber.from("1000")); // Calculate the fee (0.3% of the borrowed amount)
// const amountToRepay = borrowedAmount.add(fee); // Calculate the total amount of token0 needed to repay the loan
// const amountIn = await getAmountsInjs(amountToRepay, tokenReserve0, tokenReserve1); // Calculate the amount of token1 needed to repay the loan
// const amountInToken1 = utils.formatUnits(amountIn, token1Decimals); // Convert the amount of token1 to a human-readable format
// ///
// export async function getAmountsIO() {
    // return
    //     amountIn: BigNumber,
    //     reserveIn: BigNumber,
    //     reserveOut: BigNumber,
    //     // B1: boolean,
    //     // A1: boolean
    // ): Promise<{ amountOut: BigNumber, amountRepay: BigNumber }> {
    //     const amountOut = await getAmountsOut(amountIn, reserveIn, reserveOut)
    //     const amountRepay = await getAmountsIn(amountIn, reserveOut, reserveIn)
    // return { amountOut, amountRepay }
// }



// // //TESTING
// const prices = {
//     direction: 'A1',
//     loanPool: 'SUSHI',
//     recipient: 'QUICK',
//     amountIn: '6129.436514974971061783 WMATIC',
//     loanPoolPriceOut: 'SUSHI: 0.66379939616009057064 DAI/WMATIC',
//     loanPoolReserveA: '3465.406924111706065839',
//     loanPoolReserveB: '2300.335023674347295008',
//     recipientPriceOut: 'QUICK: 0.66160496494139968591 DAI/WMATIC',
//     recipientReserveA: '16150.828946059576534258',
//     recipientReserveB: '10685.468618632289371797',
//     amountOutLoanPool: '1467.918768287036633781 DAI',
//     amountOutRecipient: '2933.239339239750781393 DAI',
//     amountRepayLoanPool: '-5308.568677846930229064 DAI',
//     amountRepayRecipient: '6555.274720937185326739 DAI',
//     differenceAmountsOut: '0.002194431218690885 DAI (0.330586504203695737%)',
//     differenceOutvsRepay: '1465.32057095 DAI (49.9557%)',
//     projectedProfit: '8241.808017086681010457',
//     loanPoolReserves: '3465.406924111706065839 WMATIC 2300.335023674347295008 DAI',
//     recipientReserves: '16150.828946059576534258 WMATIC 10685.468618632289371797 DAI',
//     loanPremium: '0.330587%',
//     loanCost: '-8241.808017086681010457 DAI (-280.979731%)',
//     prevloanPoolK: '7971596.91881774841290771810',
//     postloanPoolK: '8014023.47094649071632210182'
// }
// async function print() {
//     let calla = await getAmountsIn(utils.parseUnits(prices.amountIn, 18), utils.parseUnits(prices.loanPoolReserveB, 18), utils.parseUnits(prices.loanPoolReserveA, 18))
//     console.log(utils.formatUnits(calla, 18))
//     const callb = await getAmountsIn(utils.parseUnits(prices.amountIn, 18), utils.parseUnits(prices.recipientReserveB, 18), utils.parseUnits(prices.recipientReserveA, 18))
//     console.log(utils.formatUnits(callb, 18))
// }
// print()
// // // export async function getAmountsOut(amountIn: BN, reserveIn: BN, reserveOut: BN) {
//     let amountInWithFee = amountIn.multipliedBy(BN(997));
//     let numerator = amountInWithFee.multipliedBy(reserveOut);
//     let denominator = reserveIn.multipliedBy(BN(1000)).add(amountInWithFee);
//     let amountOut = numerator.div(denominator);
//     return amountOut;
// }

// export async function getAmountsIn(amountOut: BN, reserveIn: BN, reserveOut: BN) {
//     const numerator = reserveIn.multipliedBy(amountOut).multipliedBy(BN(1000));
//     const denominator = reserveOut.sub(amountOut).multipliedBy(BN(997));
//     return (numerator.div(denominator)).add(BN(1));
// }


// export async function getAmountsIO(
//     amountIn: BN,
//     aReserve0: BN,
//     aReserve1: BN,
//     bReserve0: BN,
//     bReserve1: BN,
//     B1: boolean,
//     A1: boolean
// ): Promise<any> {
//     const amountOutA = await getAmountsOut(amountIn, (A1 || B1 ? aReserve0 : aReserve1), (A1 || B1 ? aReserve1 : aReserve0))
//     const amountOutB = await getAmountsOut(amountIn, (A1 || B1 ? bReserve0 : bReserve1), (A1 || B1 ? bReserve1 : bReserve0))
//     const amountInA = await getAmountsIn(amountIn, (A1 || B1 ? aReserve1 : aReserve0), (A1 || B1 ? aReserve0 : aReserve1))
//     const amountInB = await getAmountsIn(amountIn, (A1 || B1 ? bReserve1 : bReserve0), (A1 || B1 ? bReserve0 : bReserve1))
//     return { amountOutA, amountOutB, amountInA, amountInB }
// }







// export async function getAmountsInx(amountOut: BN, reserveIn: BN, reserveOut: BN) {
//     let numerator = reserveIn.multipliedBy(amountOut).multipliedBy(1000);
//     let denominator = reserveOut.sub(amountOut).multipliedBy(997);
//     let amountIn = (numerator.div(denominator)).add(1);
//     return amountIn;
// }
// function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) internal pure returns(uint amountIn) {

//         uint numerator = reserveIn.multipliedBy(amountOut).multipliedBy(1000);
//         uint denominator = reserveOut.sub(amountOut).multipliedBy(997);
//     amountIn = (numerator / denominator).add(1);
// }



//reference solidity code


// // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
// function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns(uint amountOut) {
//     require(amountIn > 0, 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT');
// //     require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
// //         uint amountInWithFee = amountIn.multipliedBy(997);
// //         uint numerator = amountInWithFee.multipliedBy(reserveOut);
// //         uint denominator = reserveIn.multipliedBy(1000).add(amountInWithFee);
// //     amountOut = numerator / denominator;
// // }



// export async function priceImpact(pool: Pool) {
//     // Get the reserves of token0 and token1 in the Uniswap pool
//     const pair = new ethers.Contract(pairAddress, IUniswapV2Pair.abi, provider);
//     const [reserve0, reserve1] = await pair.getReserves();

//     // Calculate the expected price of the trade based on the new reserves
//     const newReserve0 = reserve0.add(utils.parseUnits(amountIn, token0dec));
//     const newReserve1 = reserve1.sub(utils.parseUnits(amountOutA, token1dec));
//     const expectedPrice = newReserve1.multipliedBy(utils.parseUnits('1', token0dec)).div(newReserve0);

//     // Calculate the actual price of the trade
//     const actualPrice = utils.parseUnits(amountOutA, token1dec).div(utils.parseUnits(amountIn, token0dec));

//     // Compare the expected and actual prices
//     if (actualPrice.gt(expectedPrice)) {
//         // The trade had a price impact, adjust the amount of token0 to provide
//         const newAmountIn = expectedPrice.multipliedBy(utils.parseUnits(amountOutA, token1dec)).div(utils.parseUnits('1', token0dec));
//     }
// }

//   prevloanPoolK: '62673683260336596096008278208874583699326121',
//   postloanPoolK: '62674364084126706723607396160732338810535424'
/*

6267436408412670672360739616073 - 62673683260336596096008278208874 = 680810227900110106276



10.0001086%
6 267 436 408 412 670 672 360 739 616 073 is 10.0001% of 62 673 683 260 336 596 096 008 278 208 874


*/