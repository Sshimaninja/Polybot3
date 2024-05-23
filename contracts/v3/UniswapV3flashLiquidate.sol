// // // SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.20;

// refer to this guy's post maybe:
// https://ethereum.stackexchange.com/a/147149

// /// @notice Flash borrows underlying from Uniswap V3, liquidates the underwater account, and repays the flash loan.
// function flashLiquidate(FlashLiquidateParams memory params) external override {
//         ...
//         // Compute the flash pool key and address.
//         vars.poolKey = PoolAddress.getPoolKey({
//             tokenA: address(params.collateral),
//             tokenB: address(vars.underlying),
//             fee: params.poolFee
//         });

//         vars.zeroForOne = address(vars.underlying) == vars.poolKey.token1;

//         IUniswapV3Pool(poolFor(vars.poolKey)).swap({
//             // The recipient of the flash borrowed underlying tokens.
//             recipient: address(this),
//             // The direction of the swap, true for token0 to token1, false for token1 to token0.
//             zeroForOne: vars.zeroForOne,
//             // the amount of underlying tokens to flash borrow from the Uniswap V3 pool
//             amountSpecified: int256(params.underlyingAmount) * -1,
//             // The limit for the price the swap will push the pool to.
//             // Here it is set to global maximum or minimum possible price depending on swap direction.
//             sqrtPriceLimitX96: vars.zeroForOne ? MIN_SQRT_RATIO + 1 : MAX_SQRT_RATIO - 1,
//             // Data to be passed to swap callback.
//             data: abi.encode(
//                 UniswapV3SwapCallbackParams({
//                     bond: params.bond,
//                     borrower: params.borrower,
//                     collateral: params.collateral,
//                     poolKey: vars.poolKey,
//                     sender: msg.sender,
//                     turnout: params.turnout,
//                     underlyingAmount: params.underlyingAmount
//                 })
//             )
//         });

// /// @inheritdoc IUniswapV3SwapCallback
//     function uniswapV3SwapCallback(
//         int256 amount0Delta,
//         int256 amount1Delta,
//         bytes calldata data
//     ) external override {
//         UniswapV3SwapCallbackLocalVars memory vars;

//         // Unpack the ABI encoded data passed by the UniswapV3Pool contract.
//         UniswapV3SwapCallbackParams memory params = abi.decode(data, (UniswapV3SwapCallbackParams));

//         // Check that the caller is the Uniswap V3 flash pool contract.
//         if (msg.sender != poolFor(params.poolKey)) {
//             revert FlashUniswapV3__CallNotAuthorized(msg.sender);
//         }

//         // Mint hTokens and liquidate the borrower.
//         vars.mintedHTokenAmount = mintHTokens(...);

//         // Calculate the exact amount of collateral required to repay.
//         vars.repayAmount = uint256(amount0Delta > 0 ? amount0Delta : amount1Delta);

//         // Note that "turnout" is a signed int. When it is negative, it acts as a maximum subsidy amount.
//         // When its value is positive, it acts as a minimum profit.
//         if (int256(vars.seizeAmount) < int256(vars.repayAmount) + params.turnout) {
//             revert FlashUniswapV3__TurnoutNotSatisfied({
//                 seizeAmount: vars.seizeAmount,
//                 repayAmount: vars.repayAmount,
//                 turnout: params.turnout
//             });
//         }

//         // Reap the profit.
//         if (vars.seizeAmount > vars.repayAmount) {
//             unchecked {
//                 vars.profitAmount = vars.seizeAmount - vars.repayAmount;
//             }
//             params.collateral.safeTransfer(params.sender, vars.profitAmount);
//         }

//         // Pay back the Uniswap V3 flash borrow.
//         params.collateral.safeTransfer(msg.sender, vars.repayAmount);
// }
