import { BigNumber as BN } from "bignumber.js";
import { BoolTrade } from "../../constants/interfaces";


//Question: Why is this script returning negative numbers?
//Answer: Because the price of the loanPool is higher than the price of the recipient pool, so the amount of token0 required to equalize the ratio is negative.

// export async function lowSlippageImpact(
//   trade: BoolTrade,
//   slippageTolerance: BN,
//   virtualReserveFactor: number
// ): Promise<BN> {
//   const slippageAmount = BN(.eq.tokenOutPrice).multipliedBy(slippageTolerance);
//   const targetPrice = BN(.eq.tokenOutPrice).minus(slippageAmount);

//   // Calculate the virtual reserve out
//   const virtualReserveOut = BN(.eq.reserveOut).dividedBy(virtualReserveFactor);

//   // Calculate the virtual price
//   const virtualPrice = BN(.eq.reserveIn).div(virtualReserveOut);

//   const amountRequired = virtualReserveOut.dividedBy(targetPrice).minus(.eq.reserveIn);
//   let flashAmount = amountRequired;

//   // Check if the virtual price impact exceeds the tolerance
//   const virtualPriceImpact = virtualPrice.minus(.eq.tokenOutPrice).div(.eq.tokenOutPrice);
//   if (virtualPriceImpact.gt(slippageTolerance)) {
//     // Adjust the trade size to conform to the price impact tolerance
//     const adjustedFlashAmount = .eq.reserveIn
//       .plus(targetPrice.times(flashAmount))
//       .times(virtualReserveFactor)
//       .minus(.eq.reserveOut);

//     if (adjustedFlashAmount.lt(BN(0))) {
//       return BN(0); // Return zero if the adjusted amount is negative
//     }

//     flashAmount = adjustedFlashAmount;
//   }

//   if (flashAmount.lt(BN(0))) {
//     return BN(0); // Return zero if the calculated amount is negative
//   }

//   return flashAmount;
// }


export async function lowSlippage(reserveIn: BN, reserveOut: BN, tokenOutPrice: BN, slippageTolerance: BN,) {
  const slippageAmount = BN(.eq.tokenOutPrice).multipliedBy(slippageTolerance);
  const targetPrice = BN(.eq.tokenOutPrice).minus(slippageAmount);
  const amountRequired = BN(.eq.reserveOut).dividedBy(targetPrice).minus(.eq.reserveIn);
  // const flashAmount = amountRequired.lt(BN(trade.loanPool.reserveOut)) ? amountRequired : BN(trade.loanPool.reserveOut).div(BN(50));
  return amountRequired;
}


// export async function equalizeRatio(poolA: Pool, poolB: Pool, flip: boolean) {
//     //I doubt this is still right as I implemented a switch and only quickly updated this - need to check it again.
//     //This hasn't been updated since I implemented the switch, so it's probably wrong.
//     let flashloanAmount = BN(0);
//     if (poolA.price1.gt(poolB.price1)) {
//         const targetRatio = (poolA.price1.multipliedBy(poolB.price1)).dividedBy(BN(2)); // (1635.431910980455 + 1632.8993978139747) / 2 = 1634.165654397215
//         const targetReserves1poolA = targetRatio.multipliedBy(poolA.reserves0); // 1634.165654397215 * 95551.047591 = 158.4255736661738
//         const targetReserves1poolB = targetRatio.multipliedBy(poolB.reserves0); // 1634.165654397215 * 346052.511227 = 565.9251876081734
//         const flashloanAmountpoolA = targetReserves1poolA.minus(poolA.reserves1); // 158.4255736661738 - 58.42557366617381 = 100
//         const flashloanAmountpoolB = (flashloanAmountpoolA.div(targetRatio)) // 100 / 1634.165654397215 = 0.061
//         flashloanAmount = flashloanAmountpoolB;
//         // return flashloanAmountpoolA;
//     }
//     else if (poolB.price1.gt(poolA.price1)) {
//         const targetRatio = (poolB.price1.multipliedBy(poolA.price1)).dividedBy(BN(2)); // (1635.431910980455 + 1632.8993978139747) / 2 = 1634.165654397215
//         const targetReserves1poolA = targetRatio.multipliedBy(poolB.reserves0); // 1634.165654397215 * 95551.047591 = 158.4255736661738
//         const targetReserves1poolB = targetRatio.multipliedBy(poolA.reserves0); // 1634.165654397215 * 346052.511227 = 565.9251876081734
//         const flashloanAmountpoolB = targetReserves1poolB.minus(poolB.reserves1); // 158.4255736661738 - 58.42557366617381 = 100
//         const flashloanAmountpoolA = (flashloanAmountpoolB.div(targetRatio)) // 100 / 1634.165654397215 = 0.061
//         flashloanAmount = flashloanAmountpoolA;
//         // return flashloanAmountpoolB;
//     }
//     return flashloanAmount;

// }
  // if (poolA.price1.gt(poolB.price1)) {
  //   const targetRatio = (poolA.price1.multipliedBy(poolB.price1)).dividedBy(BN(2)); // (1635.431910980455 + 1632.8993978139747) / 2 = 1634.165654397215
  //   const targetReserves1poolA = targetRatio.multipliedBy(poolA.reserves0); // 1634.165654397215 * 95551.047591 = 158.4255736661738
  //   const targetReserves1poolB = targetRatio.multipliedBy(poolB.reserves0); // 1634.165654397215 * 346052.511227 = 565.9251876081734
  //   const flashloanAmountpoolA = targetReserves1poolA.minus(poolA.reserves1); // 158.4255736661738 - 58.42557366617381 = 100
  //   const flashloanAmountpoolB = (flashloanAmountpoolA.div(targetRatio)) // 100 / 1634.165654397215 = 0.061
  //   return flashloanAmountpoolA;
  //   flashloanAmount = flashloanAmountpoolB;
  //   // return flashloanAmountpoolA;
  // }


  // let flashB1 = BN(0);
  // let flashB0 = BN(0);
  // let flashA1 = BN(0);
  // let flashA0 = BN(0);

  // console.log("Discovering price impact...")


  //All cases:
  //Token1 is higher on recipient pool, and liquidity is higher on loanPool; borrow token


  //Case: Liquidity is higher on poolA
  //token1 is higher on poolB, but liquidity is higher on poolA,  borrow token0 from poolA and swap for token1 on poolB
  //token1 is higher on poolA, and liquidity is higher on poolA,  borrow token1 from poolA and swap for token0 on poolB 

  //Case: Liquidity is higher on poolB
  //token1 is higher on poolA, but liquidity is higher on poolB,  borrow token0 from poolB and swap for token1 on poolA
  //token1 is higher on poolB, and liquidity is higher on poolB,  borrow token1 from poolB and swap for token0 on poolA 

  // flashB1 = (() => {
  //     const slippageAmount = poolB.price1.multipliedBy(slippageTolerance);
  //     const targetPrice = poolB.price1.minus(slippageAmount)
  //     const amountRequired = poolB.reserves1.div((targetPrice)).minus(poolA.reserves0)
  //     const amountAvailable = amountRequired.lt(poolA.reserves0) ? amountRequired : poolA.reserves0;
  //     return amountAvailable
  // return amountAvailable
  // })();

  // flashA1 = (() => {
  //     const slippageAmount = poolA.price1.multipliedBy(slippageTolerance);
  //     const targetPrice = poolA.price1.minus(slippageAmount)
  //     const amountRequired = poolA.reserves1.div((targetPrice)).minus(poolA.reserves0)
  //     const amountAvailable = amountRequired.lt(poolB.reserves0) ? amountRequired : poolB.reserves0;
  //     return amountAvailable
  // })();

  // flashB0 = (() => {
  //     const slippageAmount = poolB.price0.multipliedBy(slippageTolerance);
  //     const targetPrice = poolB.price0.minus(slippageAmount)
  //     const amountRequired = poolB.reserves0.div((targetPrice)).minus(poolB.reserves1)
  //     const amountAvailable = amountRequired.lt(poolA.reserves1) ? amountRequired : poolA.reserves1;
  //     return amountAvailable
  // })();

  // flashA0 = (() => {
  //     const slippageAmount = poolA.price0.multipliedBy(slippageTolerance);
  //     const targetPrice = poolA.price0.minus(slippageAmount)
  //     const amountRequired = poolA.reserves0.div((targetPrice)).minus(poolA.reserves1)
  //     const amountAvailable = amountRequired.lt(poolB.reserves1) ? amountRequired : poolB.reserves1;
  //     return amountAvailable
  // })();

  // console.log("flashBAmountLowSlippage: " + flashBAmountLowSlippage.toFixed(2) + " " + poolB.asset)
  // console.log("flashAAmountLowSlippage: " + flashAAmountLowSlippage.toFixed(2) + " " + poolA.asset)
  // const smaller: boolean = poolB.reserves0.lt(poolA.reserves0);
  // const flashAmount = direction == "B1" ? flashB1 : direction == "B0" ? flashB0 : direction == "A1" ? flashA1 : flashA0;
  // const flashAmountLowSlippage = flashB ? flashBAmountLowSlippage : flashAAmountLowSlippage








// x = 100 ETH
// y = 200, 000 USD
// e = 1, 950

// a = (y / e) - x
//   = (200, 000 / 1, 950) - 100
//   = 2.564 ETH
/*

ETH/USD = 1,950 USD ON SUSHISWAP
ETH/USD = 2,000 USD ON UNISWAP

MAX TRADE WITH 0.6% SLIPPAGE ON SUSHISWAP:
areserveIn = 100 ETH
areserveOut = 200, 000 USD
aPrice = 2,000- (2000 * 0.03) = 1,940 USD
amountOut = (areserveIn / aPrice) - aReserveX
(200000/1940) - 100 = 3.092783505154639
3.09 ETH * 1940 USD = 5,980 USD
3.09 ETH * 2000 USD = 6,180 USD


6267368326 - 6266749586 = 618,640

618,640 / 6267368326 = 0.000098


  prevloanPoolK: '62673683260336596096008278208874583699326121',
  postloanPoolK: '62667495864271127176793614971030259594532736'

*/














//Reference: https://ethereum.stackexchange.com/questions/107159/uniswap-v2-calculate-quantity-tradable-at-target-execution-price-in-solidity

// // Bring reserves of lower priced pool up to match the price of the higher priced pool:
// export async function targetPrice(poolA: Pool, poolB: Pool) {
//     // Determine the target liquidity ratio you want to achieve
//     let targetRatio = poolA.price0;
//     if (poolA.price0 > poolB.price0) {
//         targetRatio = poolA.price0;
//     } else {
//         targetRatio = poolB.price0;
//     }

//     const targetReserves0poolA = targetRatio.multipliedBy(poolA.reserves1);
//     const targetReserves0poolB = targetRatio.multipliedBy(poolB.reserves1);
//     const flashloanAmountpoolA = targetReserves0poolA.minus(poolA.reserves0);
//     const flashloanAmountpoolB = (flashloanAmountpoolA.dividedBy(targetRatio))
//     console.log(flashloanAmountpoolB);
//     return flashloanAmountpoolB;
// }


/*
TL;DR - Final formula is at the end. It would be great if someone can verify that I didn't make any mistakes.

If we exchange token x for token y, as per the constant product formula:

ratio: 1/1000

x * y = k
100 * 100000 = 10,000,000
Let a be the amount of x we are exchanging to get b amount of y. Therefore:

(x + a) * (y - b) = k
(100 + 2) * (100000 - 200) = 10,000,000
The execution price of the trade, by definition, is just b / a.


If our target execution price is e, then b / a = e => b = ea
200 / 2 = 100 => 200 = 2 * 100


Therefore:

(x + a) * (y - ea) = k
(100 + 2) * (100000 - 2 * 100) = 10,000,000

But x * y is also equal to k, therefore:

x * y = (x + a) * (y - ea)
100 * 100000 = (100 + 2) * (100000 - 2 * 100)
Now we can just rewrite the equation to get a in terms of the other variables.

x * y = x * (y - ea) + a * (y - ea)
100 * 100000 = 100 * (100000 - 2 * 100) + 2 * (100000 - 2 * 100)


xy = xy - eax + ay - ea^2
100 * 100000 = 100 * 100000 - 2 * 100 * 100 + 2 * 100000 - 2 * 100 * 100



- eax + ay - ea^2 = 0
- 2 * 100 * 100 + 2 * 100000 - 2 * 100 * 100 = 0

-ea^2 + a(y - ex) = 0
-2 * 100 * 100 + 2 * 100000 - 2 * 100 * 100 = 0
We know a is not zero, else the price would be undefined which is not possible. Because a is not zero, we can safely divide across by a:

-ea + y - ex = 0
Now a few more slight adjustments:


ea = y - ex
a = (y - ex) / e
a = (y / e) - x
So this is the final formula:

a = (y / e) - x
2 = (100000 / 100) - 100
where a is the maximum amount we can trade to get an execution price of e or better, 
and x and y are the number of input and output tokens in the pool before the trade respectively.

TEST CASE - where 1 ETH is worth 2,000 USD

SUSHI 1/1950 ETH/USDC
QUICK 1/2000 ETH/USDC


x = 100 ETH
y = 200,000 USD
e = 1,950

a = (y / e) - x
  = (200,000 / 1,950) - 100
  = 2.564 ETH




amountIn = ( reserveIn / Price0 ) - reserveOut

amountIn = (bReseve1FN.div(bPrice1FN).sub(breserveIn))

















*/