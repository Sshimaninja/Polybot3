import { BigNumber as BN } from "bignumber.js";
import { BoolTrade } from "../../constants/interfaces";


export async function lowSlippage(reserveIn: BN, reserveOut: BN, tokenOutPrice: BN, slippageTolerance: BN,) {
    const slippageAmount = BN(tokenOutPrice).multipliedBy(slippageTolerance);
    const targetPrice = BN(tokenOutPrice).minus(slippageAmount);
    const amountRequired = BN(reserveOut).dividedBy(targetPrice).minus(reserveIn);
    // const flashAmount = amountRequired.lt(BN(trade.loanPool.reserveOut)) ? amountRequired : BN(trade.loanPool.reserveOut).div(BN(50));
    return amountRequired;
}

