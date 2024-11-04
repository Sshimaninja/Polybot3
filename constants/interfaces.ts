import { BaseContract, Contract, ethers } from "ethers";
import JSBI from "jsbi"; //import JSBI from "jsbi";import { Token as V3Token } from "@uniswap/sdk-core";
import { AmountConverter as CalcV3 } from "../scripts/v3/modules/amountConverter";
import { IRL, InRangeLiquidity } from "../scripts/v3/classes/IRL";

// import { AmountConverter as CalcV2 } from "../scripts/v2/modules/amountConverter";
export interface K {
    uniswapKPre: JSBI;
    uniswapKPost: JSBI;
    uniswapKPositive: boolean;
}

export interface ExactInput {
    amountOut: JSBI;
    sqrtPriceX96After: JSBI;
    initializedTicksCrossed: JSBI;
    gasEstimate: JSBI;
}

export interface ExactOutput {
    amountIn: JSBI;
    sqrtPriceX96After: JSBI;
    initializedTicksCrossed: JSBI;
    gasEstimate: JSBI;
}

export interface PendingTx {
    ID: string;
    warning: boolean;
}
//export interface TxData {
//    txResponse: ethers.TransactionResponse | undefined;
//    pendingID: string | null;
//}

export interface ToWMATICPool {
    ticker: string;
    tokenIn: { id: string; decimals: number; symbol: string };
    tokenOut: { id: string; decimals: number; symbol: string };
    id: string;
    exchange: string;
    liq: JSBI;
}

export interface V2Params {
    loanFactory: string;
    targetRouter: string;
    token0ID: string;
    token1ID: string;
    amount0In: JSBI;
    amount1Out: JSBI;
    amountToRepay: JSBI;
}

export interface V2Tx {
    flashParams: V2Params;
    gasObj: TxGas;
}

export interface TxGas {
    type: number;
    gasPrice: JSBI;
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
    gasLimit: JSBI;
}

export interface PolygonGasData {
    safeLow: {
        maxPriorityFee: number;
        maxFee: number;
    };
    standard: {
        maxPriorityFee: number;
        maxFee: number;
    };
    fast: {
        maxPriorityFee: number;
        maxFee: number;
    };
    estimatedBaseFee: number;
    blockTime: number;
    blockNumber: Promise<number>;
}
export interface Sizes {
    loanPool: {
        tradeSizeTokenIn: {
            size: JSBI;
            // sizeJSBI: JSBI;
        };
    };
    target: {
        tradeSizeTokenOut: {
            size: JSBI;
            // sizeJSBI: JSBI;
        };
    };
}

export interface Factory {
    exchange: string;
    factoryID: string;
    // pairs: Pair[];
}
export interface FactoryPair {
    exchangeA: string;
    factoryA_id: string;
    routerA_id: string;
    exchangeB: string;
    factoryB_id: string;
    routerB_id: string;
    matches: TradePair[];
}

export interface Pair {
    ticker: string;
    poolID: string;
    token0: {
        symbol: string;
        id: string;
        decimals: number;
    };
    token1: {
        symbol: string;
        id: string;
        decimals: number;
    };
}

export interface TradePair {
    ticker: string;
    poolAID: string;
    poolBID: string; // Changed from poolA_id and poolB_id
    token0: {
        symbol: string;
        id: string;
        decimals: number;
    };
    token1: {
        symbol: string;
        id: string;
        decimals: number;
    };
}

export interface Token {
    symbol: string;
    id: string;
    decimals: number;
}

export interface PoolInfo {
    exchange: string;
    protocol: string;
    id: string;
    fee: number;
    tickSpacing: number;
}

export interface Reserves3 {
    balance0: JSBI;
    balance1: JSBI;
    reserves0: JSBI;
    reserves1: JSBI;
    reserves0JSBI: JSBI;
    reserves1JSBI: JSBI;
    reserves0String: string;
    reserves1String: string;
}

export interface PoolStateV3 {
    ticker: string;
    id: string;
    protocol: string;
    exchange: string;
    price0: number;
    price1: number;
    liq: JSBI;
    tick: JSBI;
    fee: JSBI;
    unlocked: boolean;
}

export interface PoolState {
    poolID: string;
    sqrtPriceX96: JSBI;
    liquidity: JSBI;
    liquidityJSBI: JSBI;
    // balance0:  JSBI;
    // balance1:  JSBI;
    reservesIn: JSBI;
    reservesOut: JSBI;
    reservesInJSBI: JSBI;
    reservesOutJSBI: JSBI;
    inRangeReserves0: string;
    inRangeReserves1: string;
    priceIn: JSBI;
    priceOut: JSBI;

    // priceInJSBI: JSBI;
    // priceOutJSBI: JSBI;
}
export interface Profit {
    profit: string;
    gasEstimate: JSBI;
    gasCost: JSBI;
    gasPool: string;
    gas: GAS;
}
export interface Amounts {
    maxIn: JSBI;
    maxOut: JSBI;
    toPrice: JSBI;
}

export interface IUniswapV3Pool {
    exchange: string;
    liquidity: JSBI;
    sqrtRatioX96: JSBI;
    fee: number;
    tick: number;
    tickSpacing: number;
}

export interface Slot0 {
    sqrtPriceX96: JSBI;
    tick: number;
    fee: number;
    unlocked: boolean;
}
export interface DeployedPools {
    poolID: string;
    token0: string;
    token1: string;
    tickSpacing: number;
    fee: number;
    block: number;
}
export interface Profcalcs {
    profit: JSBI;
    profitPercent: JSBI;
}
export interface Valid3Pool {
    poolID: string;
    token0: string;
    token1: string;
    tickSpacing: number;
    fee: number;
    block: number;
}

export interface V3Matches {
    exchangeA: string;
    exchangeB: string;
    matches: Match3Pools[];
}

export interface ERC20token {
    id: string;
    symbol: string;
    decimals: number;
}
export interface Match3Pools {
    ticker: string;
    pool0: PoolInfo;
    pool1: PoolInfo;
    token0: ERC20token;
    token1: ERC20token;
}

export interface ReservesData {
    reserveIn: JSBI;
    reserveOut: JSBI;
    reserveInJSBI: JSBI;
    reserveOutJSBI: JSBI;
    blockTimestampLast: number;
}

export interface FactoryPool {
    exchange: string;
    factoryID: string;
    routerID: string;
    pairs: Pair[];
}
export interface PoolsV3 {
    ticker: string;
    poolA_id: string;
    poolB_id: string;
    token0: {
        symbol: string;
        id: string;
        decimals: number;
    };
    token1: {
        symbol: string;
        id: string;
        decimals: number;
    };
    feeTier: number;
}

export interface Repays {
    direct: JSBI;
    directInTokenOut: JSBI;
    simpleMulti: JSBI;
    getAmountsOut: JSBI;
    getAmountsIn: JSBI;
    repay: JSBI;
}
export interface V3Repays {
    //getAmountsOut: JSBI
    //getAmountsIn: JSBI
    repay: JSBI;
}

export interface V2POOLS {
    ticker: string;
    token0symbol: string;
    token1symbol: string;
    pairID: string;
    token0: string;
    dec0: string;
    token1: string;
    dec1: string;
    v2apoolID: string;
    v2aprice0: string;
    v2aprice1: string;
    v2bpoolID: string;
    v2bprice0: string;
    v2bprice1: string;
}

export interface V3POOLS {}

export interface HiLo {
    higher: JSBI;
    lower: JSBI;
}

export interface Difference {
    difference: JSBI;
    differencePercent: JSBI;
}

export interface GasData {
    tested: boolean;
    gasEstimate: bigint;
    gasPrice: bigint;
    maxFee: bigint;
    maxPriorityFee: bigint;
}

export interface GAS {
    gasEstimate: bigint;
    tested: boolean;
    gasPrice: bigint;
    maxFee: bigint;
    maxPriorityFee: bigint;
}

export interface V3FlashParams {
    token0: string;
    token1: string;
    amount0: JSBI;
    amount1: JSBI;
    fee: number;
    target: string;
    deadline: number;
    sqrtPriceLimitX96: JSBI;
    maxFlashSwapFee: JSBI;
    flashFee: JSBI;
    uniswapV3Pool1: string;
    uniswapV3PoolKey1: string;
    uniswapV3Fee1: number;
    uniswapV3TickLower1: number;
    uniswapV3TickUpper1: number;
    uniswapV3Pool2: string;
    uniswapV3PoolKey2: string;
    uniswapV3Fee2: number;
    uniswapV3TickLower2: number;
    uniswapV3TickUpper2: number;
}

export interface Bool3Trade {
    ID: string;
    direction: string;
    type: string;
    safe: boolean;
    params: any;
    ticker: string;
    tokenIn: Token;
    tokenOut: Token;
    contract: Contract;
    loanPool: {
        exchange: string;
        protocol: string;
        factory: Contract;
        router: Contract;
        quoter: Contract;
        pool: Contract;
        priceIn: JSBI;
        priceOut: JSBI;
        feeTier: number;
        state: IRL;
        inRangeLiquidity: InRangeLiquidity;
        amountRepay: JSBI;
    };
    target: {
        exchange: string;
        protocol: string;
        factory: Contract;
        router: Contract;
        quoter: Contract;
        pool: Contract;
        priceIn: JSBI;
        priceOut: JSBI;
        priceTarget: number;
        feeTier: number;
        state: IRL;
        inRangeLiquidity: InRangeLiquidity;
        tradeSize: JSBI;
        amountOut: JSBI;
    };
    // k: K
    gas: GasData;
    differenceTokenOut: number;
    differencePercent: number;
    profits: {
        tokenProfit: JSBI;
        WMATICProfit: JSBI;
    };
}
