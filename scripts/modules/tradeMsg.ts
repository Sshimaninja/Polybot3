import { SmartPair } from './smartPair';
import { SmartPool } from './smartPool';
import { Trade, BoolTrade } from '../../constants/interfaces';
import { logger } from '../../constants/contract';
import { AmountCalculator } from '../amountCalculator';
export class TradeMsg {
    sp!: SmartPool;
    trade!: BoolTrade;
    calculator!: AmountCalculator;
    constructor(sp: SmartPool, trade: BoolTrade) {
        logger.info("==============STRATEGY: " + sp.tokenInsymbol + "/" + sp.tokenOutsymbol + "==============")
        logger.info("amountIn: " + this.calculator.amountInTrade + " " + sp.tokenInsymbol + " (" + trade.direction + ")")
        logger.info(sp.ticker)
        logger.info("Price Check:" + sp.ticker)
        // logger.info(amounts)
        logger.info(trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + sp.tokenInsymbol + "/" + sp.tokenOutsymbol)
        logger.info(trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + sp.tokenInsymbol + "/" + sp.tokenOutsymbol)
        logger.info("Borrow: " + this.calculator.amountIn + " " + sp.tokenInsymbol + " from " + trade.loanPool.exchange)
        logger.info("Sell for: " + this.calculator.amountOutB + " " + sp.tokenOutsymbol + " on " + trade.recipient.exchange)
        logger.info("Repay: " + this.calculator.amountRepayA + sp.tokenOutsymbol + " to " + trade.loanPool.exchange)
        // logger.info("Loan Fee: " + this.calculator.difference.toFixed(sp.tokenOutdec)/*utils.formatUnits(premium, tokenOutdec)*/ + " " + sp.tokenOutsymbol)
        logger.info("Slippage Tolerance: " + (Number(sp.slippageTolerance) * 100) + "%")
        // logger.info("Profit:" + this.calculator.profit)
        // logger.info("ProfitPercent: " + profitPercent.toString() + " " + sp.tokenOutsymbol)
        // logger.info("Profit: " + profit.toFixed(tokenOutdec) + " " +tokenOutsymbol)}
    }
}