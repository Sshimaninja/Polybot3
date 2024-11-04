import {
    GasData,
    Match3Pools,
    PoolState,
    PoolStateV3,
} from "../../constants/interfaces";
import { flashV3Multi } from "../../constants/environment";
import { Contract } from "ethers";
import { Bool3Trade } from "../../constants/interfaces";
import { populateTrade } from "./populateTrade";
import { numberToJSBI, pu } from "../modules/convertJSBI";
import { IRL, InRangeLiquidity } from "./classes/IRL";
import { uniswapV3Exchange } from "../../constants/addresses";
//import { IRL } from './modules/price/getIRL'
import JSBI from "jsbi";
/**
 * @description
 * Class to determine trade parameters
 * returns a Bool3Trade object, which fills out all params needed for a trade.
 *
 */
export class Trade {
    trade: Bool3Trade | undefined;
    match: Match3Pools;
    pool0: Contract;
    pool1: Contract;
    irl0: InRangeLiquidity;
    irl1: InRangeLiquidity;
    state0: IRL;
    state1: IRL;
    gasData: GasData;

    constructor(
        match: Match3Pools,
        pool0: Contract,
        pool1: Contract,
        irl0: InRangeLiquidity,
        irl1: InRangeLiquidity,
        state0: IRL,
        state1: IRL,
        gasData: GasData,
    ) {
        this.match = match;
        this.pool0 = pool0;
        this.pool1 = pool1;
        this.irl0 = irl0;
        this.irl1 = irl1;
        this.state0 = state0;
        this.state1 = state1;
        this.gasData = gasData;
    }

    async direction(): Promise<{ dir: string; targetPrice: number }> {
        const A = this.state0.price1;
        const B = this.state1.price1;
        const highPrice = A > B ? A : B; //borrowing from the lowPrice pool and selling into the high price pool lowers the price of the highprice/targetpool by increasing liquidity.
        const lowPrice = A > B ? B : A;
        const dir = highPrice === A ? "A" : "B";
        const d = A ? this.match.token0.decimals : this.match.token1.decimals;

        return { dir: dir, targetPrice: lowPrice };
    }

    async getTrade() {
        const dir = await this.direction();
        const A = dir.dir == "A" ? true : false;

        const p0bigint = numberToJSBI(
            this.state0.price0,
            this.match.token0.decimals,
        );
        const p1bigint = numberToJSBI(
            this.state1.price1,
            this.match.token1.decimals,
        );

        const trade: Bool3Trade = {
            ID: A ? this.match.pool0.id : this.match.pool1.id,
            direction: dir.dir,
            type: "error",
            safe: false,
            params: "no trade",
            ticker: this.match.token0.symbol + "/" + this.match.token1.symbol,
            tokenIn: this.match.token0,
            tokenOut: this.match.token1,
            contract: flashV3Multi, // This has to be set initially, but must be changed later per type.
            loanPool: {
                exchange: A
                    ? this.match.pool1.exchange
                    : this.match.pool0.exchange,
                protocol: A
                    ? this.match.pool1.protocol
                    : this.match.pool0.protocol,
                factory: A
                    ? uniswapV3Exchange[this.match.pool1.exchange].factory
                    : uniswapV3Exchange[this.match.pool0.exchange].factory,
                quoter: A
                    ? uniswapV3Exchange[this.match.pool1.exchange].quoter
                    : uniswapV3Exchange[this.match.pool0.exchange].quoter,
                router: A
                    ? uniswapV3Exchange[this.match.pool1.exchange].router
                    : uniswapV3Exchange[this.match.pool0.exchange].router,
                pool: A ? this.pool1 : this.pool0,
                priceIn: A ? p1bigint : p0bigint,
                priceOut: A ? p0bigint : p1bigint,
                feeTier: A ? this.match.pool1.fee : this.match.pool0.fee,
                state: A ? this.state1 : this.state0,
                inRangeLiquidity: A ? this.irl1 : this.irl0,
                amountRepay: JSBI.BigInt(0),
            },
            target: {
                exchange: A
                    ? this.match.pool0.exchange
                    : this.match.pool1.exchange,
                protocol: A
                    ? this.match.pool0.protocol
                    : this.match.pool1.protocol,
                factory: A
                    ? uniswapV3Exchange[this.match.pool0.exchange].factory
                    : uniswapV3Exchange[this.match.pool1.exchange].factory,
                quoter: A
                    ? uniswapV3Exchange[this.match.pool0.exchange].quoter
                    : uniswapV3Exchange[this.match.pool1.exchange].quoter,
                router: A
                    ? uniswapV3Exchange[this.match.pool0.exchange].router
                    : uniswapV3Exchange[this.match.pool1.exchange].router,
                pool: A ? this.pool0 : this.pool1,
                priceIn: A ? p0bigint : p1bigint,
                priceOut: A ? p1bigint : p0bigint,
                priceTarget: dir.targetPrice,
                feeTier: A ? this.match.pool0.fee : this.match.pool1.fee,
                state: A ? this.state0 : this.state1,
                tradeSize: JSBI.BigInt(0),
                amountOut: JSBI.BigInt(0),
                inRangeLiquidity: A ? this.irl0 : this.irl1,
            },
            // k: {
            // 	uniswapKPre: JSBI.BigInt(0),
            // 	uniswapKPost: JSBI.BigInt(0),
            // 	uniswapKPositive: false,
            // },
            gas: this.gasData,
            differenceTokenOut: 0,
            differencePercent: 0,
            profits: {
                tokenProfit: JSBI.BigInt(0),
                WMATICProfit: JSBI.BigInt(0),
            },
        };

        await populateTrade(trade);

        return trade;
    }
}
