import { Trade, BoolTrade } from '../../constants/interfaces';
import { logger } from '../../constants/contract';
import { AmountCalculator } from '../amountCalculator';
export class TradeMsg {
    trade!: BoolTrade;
    calculator!: AmountCalculator;
    constructor(t: BoolTrade, trade: BoolTrade) {
        logger.info("==============STRATEGY: " + t.tokenIn.symbol + "/" + t.tokenOut.symbol + "==============")
        logger.info("amountIn: " + this.calculator.amountInTrade + " " + t.tokenIn.symbol + " (" + trade.direction + ")")
        logger.info(t.ticker)
        logger.info("Price Check:" + t.ticker)
        // logger.info(amounts)
        logger.info(trade.loanPool.exchange + ": " + trade.loanPool.tokenOutPrice + " " + t.tokenIn.symbol + "/" + t.tokenOut.symbol)
        logger.info(trade.recipient.exchange + ": " + trade.recipient.tokenOutPrice + " " + t.tokenIn.symbol + "/" + t.tokenOut.symbol)
        logger.info("Borrow: " + this.calculator.amountIn + " " + t.tokenIn.symbol + " from " + trade.loanPool.exchange)
        logger.info("Sell for: " + this.calculator.amountOutB + " " + t.tokenOut.symbol + " on " + trade.recipient.exchange)
        logger.info("Repay: " + this.calculator.amountRepayA + t.tokenOut.symbol + " to " + trade.loanPool.exchange)
        // logger.info("Loan Fee: " + this.calculator.difference.toFixed(t.tokenOutdec)/*utils.formatUnits(premium, tokenOutdec)*/ + " " + t.tokenOut.symbol)
        logger.info("Slippage Tolerance: " + (Number(t.slippageTolerance) * 100) + "%")
        // logger.info("Profit:" + this.calculator.profit)
        // logger.info("ProfitPercent: " + profitPercent.toString() + " " + t.tokenOut.symbol)
        // logger.info("Profit: " + profit.toFixed(tokenOutdec) + " " +tokenOut.symbol)}
    }
}