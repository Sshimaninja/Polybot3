import { BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";

export interface boolTrade {
    direction: string
    loanPool: {
        exchange: string
        poolID: string
        amountOut: BN
        amountOutjs: BigNumber,
        amountRepay: BN
        amountRepayjs: BigNumber,
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
        amountOut: BN
        amountOutjs: BigNumber,
        amountRepay: BN
        amountRepayjs: BigNumber,
        tokenOutPrice: BN
        reserveIn: BN
        reserveInjs: BigNumber
        reserveOut: BN
        reserveOutjs: BigNumber
        factoryID: string
        routerID: string
    }
}

export interface Trade {
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

export interface boolFlash {
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


export interface V2POOLS {
    ticker: string
    token0symbol: string
    token1symbol: string
    pairID: string
    token0: string
    dec0: string
    token1: string
    dec1: string
    sushiv2poolID: string
    sushiv2price0: string
    sushiv2price1: string
    quickv2poolID: string
    quickv2price0: string
    quickv2price1: string
}