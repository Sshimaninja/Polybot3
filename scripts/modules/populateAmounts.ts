import { BigNumber as BN } from "bignumber.js";
import { utils, BigNumber } from "ethers";

export async function populateAmounts() {
    const amountsjs = {
        amountOutLoanPooljs: utils.formatUnits(loanPoolAmounts.amountOut, trade.tokenOutdec),
        amountOutRecipientjs: utils.formatUnits(recipientAmounts.amountOut, trade.tokenOutdec),
        amountRepayLoanPooljs: utils.formatUnits(loanPoolAmounts.amountRepay, trade.tokenOutdec),
        amountRepayRecipientjs: utils.formatUnits(recipientAmounts.amountRepay, trade.tokenOutdec),
    }
    const amountsBN = {
        amountOutLoanPool: BN(utils.formatUnits(amountOutLoanPooljs, trade.tokenOutdec)),
        amountOutRecipient: BN(utils.formatUnits(amountOutRecipientjs, trade.tokenOutdec)),
        amountRepayLoanPool: BN(utils.formatUnits(amountRepayLoanPooljs, trade.tokenOutdec)),
        amountRepayRecipient: BN(utils.formatUnits(amountRepayRecipientjs, trade.tokenOutdec)),
    }
    return { amountsjs, amountsBN }
}
