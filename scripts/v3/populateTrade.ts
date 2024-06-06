import { Bool3Trade, IUniswapV3Pool } from "../../constants/interfaces";
import { V3Quote } from "./modules/price/v3Quote";
import { TokenProfits } from "./modules/tokenProfits";
// import { getK } from "./modules/getK";
import { filterTrade } from "./modules/filterTrade";
import { flashV3Multi } from "../../constants/environment";
import { fu, pu, numberToBigInt, BN2BigInt } from "../modules/convertBN";
import { addFee } from "./modules/calc";
import { TradeSize } from "./classes/TradeSize";
import { params } from "./modules/transaction/params";
import { importantSafetyChecks } from "./modules/importantSafetyChecks";
import { logger } from "../../constants/logger";
import { JSBI } from "@uniswap/sdk";
import { volumeToReachTargetPrice as v2pUni } from "./modules/price/ref/VoltoTargetUni";
import { volumeToReachTargetPrice as v2pAlg } from "./modules/price/ref/VoltoTargetAlg";

import { VolToTarget } from "./modules/price/ref/Vol2TargetJSBI";

export async function populateTrade(trade: Bool3Trade) {
    trade.safe = await filterTrade(trade);

    const ts = new TradeSize(trade);
    //const tradeSize = await ts.tradeToPrice();
    trade.target.tradeSize = 1000n; //pu(tradeSize, trade.tokenIn.decimals);

    if (trade.target.tradeSize === 0n) {
        //console.log("Trade size is 0, returning trade: ", trade.ticker, trade.loanPool.exchange, trade.target.exchange)
        return trade;
    }

    //return trade;
    const qt = new V3Quote(
        trade.target.pool,
        trade.target.exchange,
        trade.target.protocol,
        trade.tokenIn,
        trade.tokenOut,
    );
    const qlp = new V3Quote(
        trade.loanPool.pool,
        trade.loanPool.exchange,
        trade.loanPool.protocol,
        trade.tokenOut,
        trade.tokenIn,
    );

    if (trade.target.tradeSize === 0n) {
        console.log(
            "Trade size is 0, returning trade: ",
            trade.ticker,
            trade.loanPool.exchange,
            trade.target.exchange,
        );
        return trade;
    }
    if (trade.target.tradeSize < BigInt(1)) {
        return trade;
    }

    try {
        //console.log("Getting quote... ")
        trade.target.amountOut = (
            await qt.maxOut(trade.target.tradeSize)
        ).amountOut;
        //console.log("Quote: trade.target.amountOut: ", fu(trade.target.amountOut, trade.tokenOut.decimals) + " " + trade.tokenOut.symbol)
    } catch (e: any) {
        if (trade.loanPool.state.liquidity > trade.target.state.liquidity) {
            console.log(
                "Error in amountOut calc populateTrade.maxOut: loanPool liquidity is greater than target liquidity:",
            );
        } else {
            console.log(
                "Error in amountOut calc populateTrade.maxOut: target liquidity is greater than loanPool liquidity:",
            );
        }
        let data = {
            ticker: trade.ticker,
            protocol: trade.target.protocol,
            tradeSize:
                fu(trade.target.tradeSize, trade.tokenIn.decimals) +
                " " +
                trade.tokenIn.symbol,
            loanPoolLiq: trade.loanPool.state.liquidity,
            loanPoolR0:
                fu(trade.loanPool.state.reserves0, trade.tokenIn.decimals) +
                " " +
                trade.tokenIn.symbol,
            loanPoolR1:
                fu(trade.loanPool.state.reserves1, trade.tokenOut.decimals) +
                " " +
                trade.tokenOut.symbol,
            targetLiq: trade.target.state.liquidity,
            targetR0:
                fu(trade.target.state.reserves0, trade.tokenIn.decimals) +
                " " +
                trade.tokenIn.symbol,
            targetR1:
                fu(trade.target.state.reserves1, trade.tokenOut.decimals) +
                " " +
                trade.tokenOut.symbol,
        };
        //console.log("Error in amountOut calc populateTrade.minIn: ")
        logger.info(data);
    }
    trade.safe = await importantSafetyChecks(trade);

    if (!trade.safe) {
        console.log(
            "unsafe trade: ",
            trade.type,
            trade.ticker,
            trade.loanPool.exchange,
            trade.target.exchange,
        );
        return trade;
    }
    try {
        const repay = await qlp.minIn(
            //Will output tokenIn.
            trade.target.tradeSize,
        );
        trade.loanPool.amountRepay = repay.amountIn;
        //console.log(
        //    "Repay: trade.loanPool.amountRepay: ",
        //    fu(trade.loanPool.amountRepay, trade.tokenIn.decimals) +
        //        " " +
        //        trade.tokenIn.symbol,
        //);
    } catch (e: any) {
        //if (trade.loanPool.state.liquidity > trade.target.state.liquidity) {
        //    console.log(
        //        "Error in repay calc populateTrade.minIn: loanPool liquidity is greater than target liquidity:",
        //    );
        //} else {
        //    console.log(
        //        "Error in repay calc populateTrade.minIn: target liquidity is greater than loanPool liquidity:",
        //    );
        //}
        let data = {
            ticker: trade.ticker,
            protocol: trade.loanPool.protocol,
            tradeSize:
                fu(trade.target.tradeSize, trade.tokenIn.decimals) +
                " " +
                trade.tokenIn.symbol,
            quotedAmountOut:
                fu(trade.target.amountOut, trade.tokenOut.decimals) +
                " " +
                trade.tokenOut.symbol,
            loanPoolLiq: trade.loanPool.state.liquidity,
            loanPoolR0:
                fu(trade.loanPool.state.reserves0, trade.tokenIn.decimals) +
                " " +
                trade.tokenIn.symbol,
            loanPoolR1:
                fu(trade.loanPool.state.reserves1, trade.tokenOut.decimals) +
                " " +
                trade.tokenOut.symbol,
            targetLiq: trade.target.state.liquidity,
            targetR0:
                fu(trade.target.state.reserves0, trade.tokenIn.decimals) +
                " " +
                trade.tokenIn.symbol,
            targetR1:
                fu(trade.target.state.reserves1, trade.tokenOut.decimals) +
                " " +
                trade.tokenOut.symbol,
            errorCode: e.code,
            errorReason: e.reason,
        };
        //console.log("Error in repay calc populateTrade.minIn: ")
        logger.info(data);
        logger.info(e);
    }
    const p = new TokenProfits(trade, qlp);

    // Define repay & profit for each trade type:
    const multi = await p.getMulti();
    //const direct = await repay.getDirect()

    trade.type = "flashV3Multi";

    //trade.loanPool.amountRepay = multi.repay.repay

    trade.profits.tokenProfit = multi.profits.profit;

    trade.contract = flashV3Multi; //trade.type === 'multi' ? flashV3Multi : flashDirect

    trade.params = await params(trade);
    // Make sure there are no breaking variables in the trade: before passing it to the next function.
    await filterTrade(trade);

    return trade;
}
