import { Trade as DirectTrade } from "./populateDirectTrade";
import { Trade as MultiTrade } from "./populateMultiTrade";
import { Amounts, FactoryPair, GasData, Pair, BoolTrade } from "../../constants/interfaces";
import { Prices } from "./prices";


export async function getTrade(pair: FactoryPair, match: Pair, price0: Prices, price1: Prices, amounts0: Amounts, amounts1: Amounts, gasData: GasData): Promise<BoolTrade> {

    let directTrade = new DirectTrade(pair, match, price0, price1, amounts0, amounts1, gasData);
    let directProfit = await directTrade.getTradefromAmounts();

    let multiTrade = new MultiTrade(pair, match, price0, price1, amounts0, amounts1, gasData);
    let multiProfit = await multiTrade.getTradefromAmounts();

    let trade: BoolTrade = directProfit.profit.gt(multiProfit.profit) ? directProfit : multiProfit;

    return trade;

}