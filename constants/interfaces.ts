import { BigNumber, Contract, ethers } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { Token as V3Token } from "@uniswap/sdk-core";
export interface K {
	uniswapKPre: BigNumber,
	uniswapKPost: BigNumber
	uniswapKPositive: boolean
}

export interface PendingTx {
	ID: string
	warning: boolean
}
export interface TxData {
	txResponse: ethers.providers.TransactionResponse | undefined;
	pendingID: string | null;
}

export interface V2Params {
	loanFactory: string
	targetRouter: string
	token0ID: string
	token1ID: string
	amount0In: BigNumber
	amount1Out: BigNumber
	amountToRepay: BigNumber
}

export interface V2Tx {
	flashParams: V2Params
	gasObj: TxGas
}

export interface TxGas {
	type: number
	maxFeePerGas: number
	maxPriorityFeePerGas: number
	gasLimit: BigNumber
}

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
export interface PoolInfo {
	token0: string
	token1: string
	fee: number
	tickSpacing: number
	sqrtPriceX96: BigNumber
	liquidity: BigNumber
	tick: number
}
export interface Profit {
	profit: string;
	gasEstimate: BigNumber;
	gasCost: BigNumber;
	gasPool: string;
	gas: GAS;
}
export interface Amounts {
	maxIn: BigNumber;
	maxOut: BigNumber;
	toPrice: BigNumber;
}


export interface DeployedPools {
	poolID: string;
	token0: string;
	token1: string;
	tickSpacing: number;
	fee: number;
	block: number;
}

export interface Valid3Pool {
	poolID: string;
	token0: string;
	token1: string;
	tickSpacing: number;
	fee: number;
	block: number;
}

export interface Match3Pools {
	ticker: string;
	poolID0: {
		factory: Contract,
		id: string,
		tickSpacing: number
		fee: number
	}
	poolID1: {
		factory: Contract,
		id: string,
		tickSpacing: number
		fee: number
	}
	token0: {
		contract: Contract,
		id: string,
		symbol: string,
		decimals: number
	}
	token1: {
		contract: Contract,
		id: string,
		symbol: string,
		decimals: number
	}
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
	pairs: Pair[];
};
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
};

export interface Repays {
	simpleMulti: BigNumber
	getAmountsOut: BigNumber
	getAmountsIn: BigNumber
}

export interface BoolTrade {
	ID: string
	direction: string
	type: string
	ticker: string
	tokenIn: Token
	tokenOut: Token
	flash: Contract
	loanPool: {
		exchange: string
		factory: Contract
		router: Contract
		pool: Contract
		reserveIn: BigNumber
		reserveInBN: BN
		reserveOut: BigNumber
		reserveOutBN: BN
		priceIn: string
		priceOut: string
		repays: Repays
		amountRepay: BigNumber
	}
	target: {
		exchange: string
		factory: Contract
		router: Contract
		pool: Contract
		reserveIn: BigNumber
		reserveInBN: BN
		reserveOut: BigNumber
		reserveOutBN: BN
		priceIn: string
		priceOut: string
		tradeSize: BigNumber
		amountOut: BigNumber
	}
	k: K
	gasData: GasData
	differenceTokenOut: string
	differencePercent: string
	profit: BigNumber
	profitPercent: BigNumber
}
export interface BoolTradeV3 {
	direction: string
	type: string
	ticker: string
	tokenIn: Token
	tokenOut: Token
	flash: Contract
	loanPool: {
		exchange: string
		factory: Contract
		router: Contract
		pool: Contract
		feeTier: number
		reserveIn: BigNumber
		reserveOut: BigNumber
		priceIn: string
		priceOut: string
		amountOut: BigNumber
	}
	target: {
		exchange: string
		factory: Contract
		router: Contract
		pool: Contract
		feeTier: number
		reserveIn: BigNumber
		reserveOut: BigNumber
		priceIn: string
		priceOut: string
		tradeSize: BigNumber
		amountOut: BigNumber
	}
	k: K
	gasData: any
	amountRepay: BigNumber
	profit: BigNumber,
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


export interface GasData {
	safeLow: {
		maxPriorityFee: number,
		maxFee: number
	},
	standard: {
		maxPriorityFee: number,
		maxFee: number
	},
	fast: {
		maxPriorityFee: number,
		maxFee: number
	},
	estimatedBaseFee: number,
	blockTime: number,
	blockNumber: Promise<number>,
}

export interface GAS {
	gasEstimate: BigNumber,
	tested: boolean,
	gasPrice: BigNumber,
	maxFee: BigNumber,
	maxPriorityFee: BigNumber
}



export interface V3FlashParams {
	token0: string;
	token1: string;
	amount0: BigNumber;
	amount1: BigNumber;
	fee: number;
	target: string;
	deadline: number;
	sqrtPriceLimitX96: BigNumber;
	maxFlashSwapFee: BigNumber;
	flashFee: BigNumber;
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