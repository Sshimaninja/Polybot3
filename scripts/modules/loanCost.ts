import { BigNumber } from 'ethers';
import { BigNumber as BN } from 'bignumber.js'


export async function calculateLoanCost(
    amountOutLoanPool: BN,
    amountRepayLoanPool: BN
): Promise<{ loanCost: BN, loanCostPercentage: BN }> {
    let loanCost = amountOutLoanPool.minus(amountRepayLoanPool)
    let loanCostPercentage = loanCost.dividedBy(amountOutLoanPool).multipliedBy(100)

    return { loanCost, loanCostPercentage }
}
