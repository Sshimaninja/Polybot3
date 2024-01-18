// /**
//  * 
//  * @param {Token} token 
//  * @param {string} inputAmount no decimal format: ex: 0.01
//  * @param {Number} slippageAmount / 10000; ex: 50/10000 -> 0.5%
//  * @param {Number} deadline Math.floor(Date.now() / 1000 + 1800)
//  * @param {ethers.Wallet} account new ethers.Wallet(privateKey, provider);
//  * @param {Mode} mode BUY or SELL
//  * @returns 
//  */
// const swapUpdatePrice = async (
//   account,
//   token,
//   inputAmount,
//   slippageAmount,
//   deadline,
//   mode
// ) => {
//   const walletAddress = account.address;
//   const percentSlippage = new Percent(slippageAmount, 10000);

//   // best route detection
//   let inputToken = ETH;
//   let outputCurrency = token;
//   if (mode == SWAP_MODE.SELL) {
//     inputToken = token;
//     outputCurrency = ETH;
//   }

//   const wei = ethers.utils.parseUnits(inputAmount.toString(), inputToken.decimals);

//   const currencyAmount = CurrencyAmount.fromRawAmount(
//     inputToken,
//     wei
//   );
//   const route = await router.route(currencyAmount, outputCurrency, TradeType.EXACT_INPUT, {
//     recipient: walletAddress,
//     slippageTolerance: percentSlippage,
//     deadline: deadline,
//     type: SwapType.UNIVERSAL_ROUTER,
//   });

//   const value = BigNumber.from(route.methodParameters.value);
//   const transaction = {
//     data: route.methodParameters.calldata,
//     to: V3_SWAP_ROUTER_ADDRESS,
//     value: value,
//     from: walletAddress,
//     gasPrice: route.gasPriceWei,
//     gasLimit: BigNumber.from("10000000"),
//   };

//   const quoteAmountOut = route.quote.toFixed(6);
//   const ratio = (inputAmount / quoteAmountOut).toFixed(3);
  
//   return { 
//     tx: transaction, 
//     quote: quoteAmountOut,
//     ratio: ratio
//   };
// };