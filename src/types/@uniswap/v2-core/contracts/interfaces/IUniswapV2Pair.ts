/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigInt,
  BigIntish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../../common";

export interface IUniswapV2PairInterface extends utils.Interface {
  functions: {
    "DOMAIN_SEPARATOR()": FunctionFragment;
    "MINIMUM_LIQUIDITY()": FunctionFragment;
    "PERMIT_TYPEHASH()": FunctionFragment;
    "allowance(address,address)": FunctionFragment;
    "approve(address,uint256)": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "burn(address)": FunctionFragment;
    "decimals()": FunctionFragment;
    "factory()": FunctionFragment;
    "getReserves()": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "kLast()": FunctionFragment;
    "mint(address)": FunctionFragment;
    "name()": FunctionFragment;
    "nonces(address)": FunctionFragment;
    "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)": FunctionFragment;
    "price0CumulativeLast()": FunctionFragment;
    "price1CumulativeLast()": FunctionFragment;
    "skim(address)": FunctionFragment;
    "swap(uint256,uint256,address,bytes)": FunctionFragment;
    "symbol()": FunctionFragment;
    "sync()": FunctionFragment;
    "token0()": FunctionFragment;
    "token1()": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "transfer(address,uint256)": FunctionFragment;
    "transferFrom(address,address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "DOMAIN_SEPARATOR"
      | "MINIMUM_LIQUIDITY"
      | "PERMIT_TYPEHASH"
      | "allowance"
      | "approve"
      | "balanceOf"
      | "burn"
      | "decimals"
      | "factory"
      | "getReserves"
      | "initialize"
      | "kLast"
      | "mint"
      | "name"
      | "nonces"
      | "permit"
      | "price0CumulativeLast"
      | "price1CumulativeLast"
      | "skim"
      | "swap"
      | "symbol"
      | "sync"
      | "token0"
      | "token1"
      | "totalSupply"
      | "transfer"
      | "transferFrom"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "DOMAIN_SEPARATOR",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MINIMUM_LIQUIDITY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PERMIT_TYPEHASH",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "allowance",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [PromiseOrValue<string>, PromiseOrValue<BigIntish>]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "burn",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(functionFragment: "factory", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getReserves",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "kLast", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "nonces",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "permit",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "price0CumulativeLast",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "price1CumulativeLast",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "skim",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(functionFragment: "sync", values?: undefined): string;
  encodeFunctionData(functionFragment: "token0", values?: undefined): string;
  encodeFunctionData(functionFragment: "token1", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [PromiseOrValue<string>, PromiseOrValue<BigIntish>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigIntish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "DOMAIN_SEPARATOR",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MINIMUM_LIQUIDITY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PERMIT_TYPEHASH",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "burn", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "factory", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getReserves",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "kLast", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "nonces", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "permit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "price0CumulativeLast",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "price1CumulativeLast",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "skim", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "sync", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token0", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token1", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;

  events: {
    "Approval(address,address,uint256)": EventFragment;
    "Burn(address,uint256,uint256,address)": EventFragment;
    "Mint(address,uint256,uint256)": EventFragment;
    "Swap(address,uint256,uint256,uint256,uint256,address)": EventFragment;
    "Sync(uint112,uint112)": EventFragment;
    "Transfer(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Burn"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Mint"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Swap"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Sync"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
}

export interface ApprovalEventObject {
  owner: string;
  spender: string;
  value: bigint;
}
export type ApprovalEvent = TypedEvent<
  [string, string, BigInt],
  ApprovalEventObject
>;

export type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;

export interface BurnEventObject {
  sender: string;
  amount0: bigint;
  amount1: bigint;
  to: string;
}
export type BurnEvent = TypedEvent<
  [string, BigInt, BigInt, string],
  BurnEventObject
>;

export type BurnEventFilter = TypedEventFilter<BurnEvent>;

export interface MintEventObject {
  sender: string;
  amount0: bigint;
  amount1: bigint;
}
export type MintEvent = TypedEvent<
  [string, BigInt, BigInt],
  MintEventObject
>;

export type MintEventFilter = TypedEventFilter<MintEvent>;

export interface SwapEventObject {
  sender: string;
  amount0In: bigint;
  amount1In: bigint;
  amount0Out: bigint;
  amount1Out: bigint;
  to: string;
}
export type SwapEvent = TypedEvent<
  [string, BigInt, BigInt, BigInt, BigInt, string],
  SwapEventObject
>;

export type SwapEventFilter = TypedEventFilter<SwapEvent>;

export interface SyncEventObject {
  reserve0: bigint;
  reserve1: bigint;
}
export type SyncEvent = TypedEvent<[BigInt, BigInt], SyncEventObject>;

export type SyncEventFilter = TypedEventFilter<SyncEvent>;

export interface TransferEventObject {
  from: string;
  to: string;
  value: bigint;
}
export type TransferEvent = TypedEvent<
  [string, string, BigInt],
  TransferEventObject
>;

export type TransferEventFilter = TypedEventFilter<TransferEvent>;

export interface IUniswapV2Pair extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IUniswapV2PairInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<[string]>;

    MINIMUM_LIQUIDITY(overrides?: CallOverrides): Promise<[BigInt]>;

    PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<[string]>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigInt]>;

    approve(
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    balanceOf(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigInt]>;

    burn(
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    decimals(overrides?: CallOverrides): Promise<[number]>;

    factory(overrides?: CallOverrides): Promise<[string]>;

    getReserves(
      overrides?: CallOverrides
    ): Promise<
      [BigInt, BigInt, number] & {
        reserve0: bigint;
        reserve1: bigint;
        blockTimestampLast: number;
      }
    >;

    initialize(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    kLast(overrides?: CallOverrides): Promise<[BigInt]>;

    mint(
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    name(overrides?: CallOverrides): Promise<[string]>;

    nonces(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigInt]>;

    permit(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      deadline: PromiseOrValue<BigIntish>,
      v: PromiseOrValue<BigIntish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    price0CumulativeLast(overrides?: CallOverrides): Promise<[BigInt]>;

    price1CumulativeLast(overrides?: CallOverrides): Promise<[BigInt]>;

    skim(
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    swap(
      amount0Out: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      to: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    symbol(overrides?: CallOverrides): Promise<[string]>;

    sync(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    token0(overrides?: CallOverrides): Promise<[string]>;

    token1(overrides?: CallOverrides): Promise<[string]>;

    totalSupply(overrides?: CallOverrides): Promise<[BigInt]>;

    transfer(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<string>;

  MINIMUM_LIQUIDITY(overrides?: CallOverrides): Promise<BigInt>;

  PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<string>;

  allowance(
    owner: PromiseOrValue<string>,
    spender: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigInt>;

  approve(
    spender: PromiseOrValue<string>,
    value: PromiseOrValue<BigIntish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  balanceOf(
    owner: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigInt>;

  burn(
    to: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  decimals(overrides?: CallOverrides): Promise<number>;

  factory(overrides?: CallOverrides): Promise<string>;

  getReserves(
    overrides?: CallOverrides
  ): Promise<
    [BigInt, BigInt, number] & {
      reserve0: bigint;
      reserve1: bigint;
      blockTimestampLast: number;
    }
  >;

  initialize(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  kLast(overrides?: CallOverrides): Promise<BigInt>;

  mint(
    to: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  name(overrides?: CallOverrides): Promise<string>;

  nonces(
    owner: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigInt>;

  permit(
    owner: PromiseOrValue<string>,
    spender: PromiseOrValue<string>,
    value: PromiseOrValue<BigIntish>,
    deadline: PromiseOrValue<BigIntish>,
    v: PromiseOrValue<BigIntish>,
    r: PromiseOrValue<BytesLike>,
    s: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  price0CumulativeLast(overrides?: CallOverrides): Promise<BigInt>;

  price1CumulativeLast(overrides?: CallOverrides): Promise<BigInt>;

  skim(
    to: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  swap(
    amount0Out: PromiseOrValue<BigIntish>,
    amount1Out: PromiseOrValue<BigIntish>,
    to: PromiseOrValue<string>,
    data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  symbol(overrides?: CallOverrides): Promise<string>;

  sync(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  token0(overrides?: CallOverrides): Promise<string>;

  token1(overrides?: CallOverrides): Promise<string>;

  totalSupply(overrides?: CallOverrides): Promise<BigInt>;

  transfer(
    to: PromiseOrValue<string>,
    value: PromiseOrValue<BigIntish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transferFrom(
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    value: PromiseOrValue<BigIntish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<string>;

    MINIMUM_LIQUIDITY(overrides?: CallOverrides): Promise<BigInt>;

    PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<string>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigInt>;

    approve(
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    balanceOf(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigInt>;

    burn(
      to: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigInt, BigInt] & { amount0: bigint; amount1: bigint }
    >;

    decimals(overrides?: CallOverrides): Promise<number>;

    factory(overrides?: CallOverrides): Promise<string>;

    getReserves(
      overrides?: CallOverrides
    ): Promise<
      [BigInt, BigInt, number] & {
        reserve0: bigint;
        reserve1: bigint;
        blockTimestampLast: number;
      }
    >;

    initialize(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    kLast(overrides?: CallOverrides): Promise<BigInt>;

    mint(
      to: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigInt>;

    name(overrides?: CallOverrides): Promise<string>;

    nonces(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigInt>;

    permit(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      deadline: PromiseOrValue<BigIntish>,
      v: PromiseOrValue<BigIntish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    price0CumulativeLast(overrides?: CallOverrides): Promise<BigInt>;

    price1CumulativeLast(overrides?: CallOverrides): Promise<BigInt>;

    skim(to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;

    swap(
      amount0Out: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      to: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    symbol(overrides?: CallOverrides): Promise<string>;

    sync(overrides?: CallOverrides): Promise<void>;

    token0(overrides?: CallOverrides): Promise<string>;

    token1(overrides?: CallOverrides): Promise<string>;

    totalSupply(overrides?: CallOverrides): Promise<BigInt>;

    transfer(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    "Approval(address,address,uint256)"(
      owner?: PromiseOrValue<string> | null,
      spender?: PromiseOrValue<string> | null,
      value?: null
    ): ApprovalEventFilter;
    Approval(
      owner?: PromiseOrValue<string> | null,
      spender?: PromiseOrValue<string> | null,
      value?: null
    ): ApprovalEventFilter;

    "Burn(address,uint256,uint256,address)"(
      sender?: PromiseOrValue<string> | null,
      amount0?: null,
      amount1?: null,
      to?: PromiseOrValue<string> | null
    ): BurnEventFilter;
    Burn(
      sender?: PromiseOrValue<string> | null,
      amount0?: null,
      amount1?: null,
      to?: PromiseOrValue<string> | null
    ): BurnEventFilter;

    "Mint(address,uint256,uint256)"(
      sender?: PromiseOrValue<string> | null,
      amount0?: null,
      amount1?: null
    ): MintEventFilter;
    Mint(
      sender?: PromiseOrValue<string> | null,
      amount0?: null,
      amount1?: null
    ): MintEventFilter;

    "Swap(address,uint256,uint256,uint256,uint256,address)"(
      sender?: PromiseOrValue<string> | null,
      amount0In?: null,
      amount1In?: null,
      amount0Out?: null,
      amount1Out?: null,
      to?: PromiseOrValue<string> | null
    ): SwapEventFilter;
    Swap(
      sender?: PromiseOrValue<string> | null,
      amount0In?: null,
      amount1In?: null,
      amount0Out?: null,
      amount1Out?: null,
      to?: PromiseOrValue<string> | null
    ): SwapEventFilter;

    "Sync(uint112,uint112)"(reserve0?: null, reserve1?: null): SyncEventFilter;
    Sync(reserve0?: null, reserve1?: null): SyncEventFilter;

    "Transfer(address,address,uint256)"(
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      value?: null
    ): TransferEventFilter;
    Transfer(
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      value?: null
    ): TransferEventFilter;
  };

  estimateGas: {
    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<BigInt>;

    MINIMUM_LIQUIDITY(overrides?: CallOverrides): Promise<BigInt>;

    PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<BigInt>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigInt>;

    approve(
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    balanceOf(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigInt>;

    burn(
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    decimals(overrides?: CallOverrides): Promise<BigInt>;

    factory(overrides?: CallOverrides): Promise<BigInt>;

    getReserves(overrides?: CallOverrides): Promise<BigInt>;

    initialize(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    kLast(overrides?: CallOverrides): Promise<BigInt>;

    mint(
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    name(overrides?: CallOverrides): Promise<BigInt>;

    nonces(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigInt>;

    permit(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      deadline: PromiseOrValue<BigIntish>,
      v: PromiseOrValue<BigIntish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    price0CumulativeLast(overrides?: CallOverrides): Promise<BigInt>;

    price1CumulativeLast(overrides?: CallOverrides): Promise<BigInt>;

    skim(
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    swap(
      amount0Out: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      to: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    symbol(overrides?: CallOverrides): Promise<BigInt>;

    sync(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    token0(overrides?: CallOverrides): Promise<BigInt>;

    token1(overrides?: CallOverrides): Promise<BigInt>;

    totalSupply(overrides?: CallOverrides): Promise<BigInt>;

    transfer(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;
  };

  populateTransaction: {
    DOMAIN_SEPARATOR(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    MINIMUM_LIQUIDITY(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PERMIT_TYPEHASH(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    approve(
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    balanceOf(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    burn(
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    factory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getReserves(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    initialize(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    kLast(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    mint(
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nonces(
      owner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    permit(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      deadline: PromiseOrValue<BigIntish>,
      v: PromiseOrValue<BigIntish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    price0CumulativeLast(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    price1CumulativeLast(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    skim(
      to: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    swap(
      amount0Out: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      to: PromiseOrValue<string>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    sync(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    token0(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    token1(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transfer(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
