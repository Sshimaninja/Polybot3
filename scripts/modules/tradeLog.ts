
import { utils } from "ethers";
import { BoolTrade } from "../../constants/interfaces";
/**
 * This doc calculates whether trade will revert due to uniswak K being positive or negative
 * Uni V2 price formula: X * Y = K
 * @param trade 
 * @returns Uniswap K before and after trade, and whether it is positive or negative
 */
export async function tradeLogs(trade: BoolTrade): Promise<any> {
    const d = {
        trade: trade.type,
        ticker: trade.ticker,
        loanPool: {
            exchange: trade.loanPool.exchange,
            priceIn: trade.loanPool.priceIn,
            priceOut: trade.loanPool.priceOut,
            reservesIn: utils.formatUnits(trade.loanPool.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
            reservesOut: utils.formatUnits(trade.loanPool.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
            amountRepay:
                trade.type === "multi" ? (
                    utils.formatUnits(trade.amountRepay, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol
                ) : trade.type === "direct" ? (
                    utils.formatUnits(trade.amountRepay, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol) : "error",
        },
        recipient: {
            exchange: trade.recipient.exchange,
            priceIn: trade.recipient.priceIn,
            priceOut: trade.recipient.priceOut,
            reservesIn: utils.formatUnits(trade.recipient.reserveIn, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
            reservesOut: utils.formatUnits(trade.recipient.reserveOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
            tradeSize: utils.formatUnits(trade.recipient.tradeSize, trade.tokenIn.decimals) + " " + trade.tokenIn.symbol,
            amountOut: utils.formatUnits(trade.recipient.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
        },
        result: {
            uniswapkPre: trade.k.uniswapKPre.gt(0) ? trade.k.uniswapKPre.toString() : 0,
            uniswapkPost: trade.k.uniswapKPost.gt(0) ? trade.k.uniswapKPost.toString() : 0,
            uniswapKPositive: trade.k.uniswapKPositive,
            // loanCostPercent: utils.formatUnits((trade.loanPool.amountOut.div(trade.amountRepay)).mul(100), trade.tokenOut.decimals),
            profit: utils.formatUnits(trade.profit, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol,
        }
    }
    console.log(d);
}