import { BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";

export interface Factory {
    exchange: string;
    factoryID: string;
    // pairs: Pair[];
};
export interface FactoryPair {
    exchangeA: string;
    factoryA_id: string;
    routerA_id: string;
    exchangeB: string;
    factoryB_id: string;
    routerB_id: string;
    matches: Pair[];
}
export interface Pair {
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
};
export interface Token {
    symbol: string;
    id: string;
    decimals: number;
}

export interface Amounts {
    tradeSize: BigNumber;
    amountOutBN: BN;
    amountOutJS: BigNumber;
    amountRepayBN: BN;
    amountRepayJS: BigNumber;
}

export interface ReservesData {
    reserveIn: BigNumber;
    reserveOut: BigNumber;
    reserveInBN: BN;
    reserveOutBN: BN;
    blockTimestampLast: number;
}

export interface FactoryPool {
    exchange: string;
    factoryID: string;
    routerID: string;
    pairs: Pool[];
};
export interface Pool {
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
};
export interface BoolTrade {
    direction: string
    ticker: string
    tokenIn: Token
    tokenOut: Token
    tradeSize: BigNumber
    loanPool: {
        exchange: string
        factory: string
        router: string
        poolID: string
        amountOut: BN
        amountOutjs: BigNumber,
        amountRepay: BN
        amountRepayjs: BigNumber,
        tokenOutPrice: BN | undefined
        reserveIn: BN | undefined
        reserveInjs: BigNumber | undefined
        reserveOut: BN | undefined
        reserveOutjs: BigNumber | undefined
        factoryID: string
        routerID: string
    }
    recipient: {
        exchange: string
        factory: string
        router: string
        poolID: string
        amountOut: BN
        amountOutjs: BigNumber,
        amountRepay: BN
        amountRepayjs: BigNumber,
        tokenOutPrice: BN | undefined
        reserveIn: BN | undefined
        reserveInjs: BigNumber | undefined
        reserveOut: BN | undefined
        reserveOutjs: BigNumber | undefined
        factoryID: string
        routerID: string
    }
    profitBN: BN,
    profitJS: BigNumber,
}

export interface Trade {
    trade: any;
    direction: string
    amountIn: BN
    tokenInsymbol: string
    tokenInPrice: BN
    tokenInID: string
    tokenIndec: number
    tokenOutsymbol: string
    tokenOutPrice: BN
    tokenOutID: string
    tokenOutdec: number
    loanPool: {
        exchange: string
        poolID: string
        tokenInPrice: BN
        tokenOutPrice: BN
        reserveIn: BN
        reserveInjs: BigNumber
        reserveOut: BN
        reserveOutjs: BigNumber
        factoryID: string
        routerID: string
    }
    recipient: {
        exchange: string
        poolID: string
        tokenInPrice: BN
        tokenOutPrice: BN
        reserveIn: BN
        reserveInjs: BigNumber
        reserveOut: BN
        reserveOutjs: BigNumber
        factoryID: string
        routerID: string
    }
}

export interface BoolFlash {
    ticker: string
    tokenInsymbol: string
    // tokenInPrice: BigNumber
    tokenInID: string
    tokenIndec: number
    tokenOutsymbol: string
    tokenOutPrice: BigNumber
    tokenOutID: string
    tokenOutdec: number
    amountIn: BigNumber
    expectedProfit: BigNumber
    loanPool: {
        exchange: string
        poolID: string
        // tokenInPrice: BigNumber
        tokenOutPrice: BigNumber
        reserveIn: BigNumber
        reserveOut: BigNumber
        factoryID: string
        routerID: string
        amountOut: BigNumber
        amountRepay: BigNumber
    }
    recipient: {
        exchange: string
        poolID: string
        // tokenInPrice: BigNumber
        tokenOutPrice: BigNumber
        reserveIn: BigNumber
        reserveOut: BigNumber
        factoryID: string
        routerID: string
        amountOut: BigNumber
    }
}

export interface Flash {
    ticker: string
    tokenInsymbol: string
    tokenInPrice: BigNumber
    tokenInID: string
    tokenIndec: number
    tokenOutsymbol: string
    tokenOutPrice: BigNumber
    tokenOutID: string
    tokenOutdec: number
    amountIn: BigNumber
    expectedProfit: BigNumber
    loanPool: {
        exchange: string
        poolID: string
        tokenInPrice: BigNumber
        tokenOutPrice: BigNumber
        reserveIn: BigNumber
        reserveOut: BigNumber
        factoryID: string
        routerID: string
        amountOut: BigNumber
        amountRepay: BigNumber
    }
    recipient: {
        exchange: string
        poolID: string
        tokenInPrice: BigNumber
        tokenOutPrice: BigNumber
        reserveIn: BigNumber
        reserveOut: BigNumber
        factoryID: string
        routerID: string
        amountOut: BigNumber
    }
}

export interface Profit {
    profit: BN,
    profitPercent: number,
    profitjs: BigNumber,
}

export interface V2POOLS {
    ticker: string
    token0symbol: string
    token1symbol: string
    pairID: string
    token0: string
    dec0: string
    token1: string
    dec1: string
    v2apoolID: string
    v2aprice0: string
    v2aprice1: string
    v2bpoolID: string
    v2bprice0: string
    v2bprice1: string
}

export interface V3POOLS {
}

export interface HiLo {
    higher: BN;
    lower: BN;
}

export interface Difference {
    difference: BN;
    differencePercent: BN;
}
