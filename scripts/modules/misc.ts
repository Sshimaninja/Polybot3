// [{
//     const directRepayAmt0BN: string = BN(utils.formatUnits(this.amounts0.tradeSize, this.match.token0.decimals)).multipliedBy(1.003009027).toFixed(this.match.token0.decimals);
//     const directRepayAmt1BN: string = BN(utils.formatUnits(this.amounts1.tradeSize, this.match.token0.decimals)).multipliedBy(1.003009027).toFixed(this.match.token0.decimals);

//     const directRepay0: BigNumber = utils.parseUnits(directRepayAmt0BN, this.match.token0.decimals);
//     const directRepay1: BigNumber = utils.parseUnits(directRepayAmt1BN, this.match.token0.decimals);

//     // Determine direct repayment by passing the receiving pool's calculated 0.1% slippage tradeSize using the loanPool's reserves
//     const repay0 = await getAmountsIn(directRepay0, this.price0.reserves.reserveOut, this.price0.reserves.reserveIn);
//     const repay1 = await getAmountsIn(directRepay1, this.price1.reserves.reserveOut, this.price1.reserves.reserveIn);

//     const A: BN = this.price0.priceOutBN;
//     const B: BN = this.price1.priceOutBN;
// }]