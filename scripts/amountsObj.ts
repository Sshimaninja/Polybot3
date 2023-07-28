import { BoolTrade } from "../constants/interfaces"
import { SmartPool } from "./modules/smartPool"
import { AmountCalculator } from './amountCalculator';


export class AmountsMsg {
    trade!: BoolTrade;
    sp!: SmartPool;

    constructor(trade: BoolTrade, sp: SmartPool) {
        const amounts = {
            direction: trade.direction,
            loanPool: trade.loanPool.exchange,
            recipient: trade.recipient.exchange,
            amountIn: await calculator.getTradeAmount() + " " + sp.tokenInsymbol,
            amountOutLoanPool: amountOutLoanPool.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
            amountOutRecipient: amountOutRecipient.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
            amountRepayLoanPool: amountRepayLoanPool.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
            amountRepayRecipient: amountRepayRecipient.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
            loanPoolPriceOut: trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + sp.tokenOutsymbol + "/" + sp.tokenInsymbol,
            recipientPriceOut: trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + sp.tokenOutsymbol + "/" + sp.tokenInsymbol,
            differenceAmountsOut: differencePrice.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol + " (" + differencePercent.toFixed(sp.tokenOutdec) + "%)",
            differenceOutvsRepay: (differenceOut.toFixed(8) + " " + sp.tokenOutsymbol + " (" + ((differenceOut.dividedBy(amountOutRecipient)).multipliedBy(100)).toFixed(4) + "%)"),
            projectedProfit: profit.toFixed(sp.tokenOutdec),
            loanPoolReserves: trade.loanPool.reserveIn.toFixed(sp.tokenIndec) + " " + sp.tokenInsymbol + " " + trade.loanPool.reserveOut.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
            recipientReserves: trade.recipient.reserveIn.toFixed(sp.tokenIndec) + " " + sp.tokenInsymbol + " " + trade.recipient.reserveOut.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol,
            loanPremium: loanprem.toFixed(6) + "%",
            loanCost: loanCost.loanCost.toFixed(sp.tokenOutdec) + " " + sp.tokenOutsymbol + " (" + loanCost.loanCostPercentage.toFixed(6) + "%)",
            //The following must be equal after the flash loan is repaid.

            prevloanPoolK: trade.loanPool.reserveIn.multipliedBy(trade.loanPool.reserveOut).toFixed(20),
            postloanPoolK: (trade.loanPool.reserveIn.minus(calculator.amountInTrade)).multipliedBy(trade.loanPool.reserveOut.plus(amountRepayLoanPool)).toFixed(20),
        }
    }
}