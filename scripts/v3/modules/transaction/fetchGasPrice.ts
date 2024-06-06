import { Bool3Trade, GAS } from "../../../../constants/interfaces";
import { logger } from "../../../../constants/logger";
import { fu } from "../../../modules/convertBN";
import { pendingTransactions } from "../../control";
import { params } from "../transaction/params";

/**
 * @param trade
 * @returns gas estimate and gas price for a given trade.
 * If the g.gasEstimate fails, it will return a default gas estimate of 300000.
 * @returns gasData: { g.gasEstimate: bigint, gasPrice: bigint, maxFee: number, maxPriorityFee: number }
 */
export async function fetchGasPrice(trade: Bool3Trade): Promise<GAS> {
    let g: GAS = {
        gasEstimate: trade.gas.gasEstimate,
        tested: false,
        gasPrice: trade.gas.gasPrice,
        maxFee: trade.gas.maxFee,
        maxPriorityFee: trade.gas.maxPriorityFee,
    };
    try {
        if (pendingTransactions[trade.ID] == true) {
            logger.info("Pending transaction. Skipping trade.");
            return g;
        }
        pendingTransactions[trade.ID] == true;
        const p = await params(trade);
        if (trade.type.includes("flash")) {
            g.gasEstimate = await trade.contract.initFlash.estimateGas(
                p.flashParams,
            );
        }
        //if (trade.type === "single" || trade.type === "multi") {
        //	g.gasEstimate = await trade.contract.swapSingle.estimateGas(
        //		ps.routerAID,
        //		ps.routerBID,
        //		ps.tradeSize,
        //		ps.amountOutA,
        //		ps.path0,
        //		ps.path1,
        //		ps.to,
        //		ps.deadline,
        //	);
        //}
        logger.info(">>>>>>>>>>gasEstimate SUCCESS: ", g.gasEstimate);
        let gasPrice = g.gasEstimate * trade.gas.maxFee;
        logger.info("GASLOGS: ", gasPrice);
        logger.info("GASESTIMATE SUCCESS::::::", fu(gasPrice, 18));
        pendingTransactions[trade.ID] == false;
        return {
            gasEstimate: trade.gas.gasEstimate * 2n,
            tested: true,
            gasPrice: trade.gas.gasPrice * 2n,
            maxFee: trade.gas.maxFee * 2n,
            maxPriorityFee: trade.gas.maxPriorityFee * 2n,
        };
    } catch (error: any) {
        // const data = await tradeLogs(trade);
        logger.error(
            `>>>>>>>>>>Error in fetchGasPrice for trade: ${trade.ticker} ${trade.type} ${error.reason} <<<<<<<<<<<<<<<<`,
            // error,
        );
        return {
            gasEstimate: trade.gas.gasEstimate * 2n,
            tested: false,
            gasPrice: trade.gas.gasPrice * 2n,
            maxFee: trade.gas.maxFee * 2n,
            maxPriorityFee: trade.gas.maxPriorityFee * 2n,
        };
    }
}
