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
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export interface FlashOneInterface extends utils.Interface {
  functions: {
    "checkOwner()": FunctionFragment;
    "flashSwap(address,address,address,address,uint256,uint256)": FunctionFragment;
    "uniswapV2Call(address,uint256,uint256,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "checkOwner" | "flashSwap" | "uniswapV2Call"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "checkOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "flashSwap",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BigIntish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "uniswapV2Call",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "checkOwner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "flashSwap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "uniswapV2Call",
    data: BytesLike
  ): Result;

  events: {};
}

export interface FlashOne extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FlashOneInterface;

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
    checkOwner(overrides?: CallOverrides): Promise<[string]>;

    flashSwap(
      loanFactory: PromiseOrValue<string>,
      recipientRouter: PromiseOrValue<string>,
      token0ID: PromiseOrValue<string>,
      token1ID: PromiseOrValue<string>,
      amount0In: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  checkOwner(overrides?: CallOverrides): Promise<string>;

  flashSwap(
    loanFactory: PromiseOrValue<string>,
    recipientRouter: PromiseOrValue<string>,
    token0ID: PromiseOrValue<string>,
    token1ID: PromiseOrValue<string>,
    amount0In: PromiseOrValue<BigIntish>,
    amount1Out: PromiseOrValue<BigIntish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  uniswapV2Call(
    _sender: PromiseOrValue<string>,
    _amount0: PromiseOrValue<BigIntish>,
    _amount1: PromiseOrValue<BigIntish>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    checkOwner(overrides?: CallOverrides): Promise<string>;

    flashSwap(
      loanFactory: PromiseOrValue<string>,
      recipientRouter: PromiseOrValue<string>,
      token0ID: PromiseOrValue<string>,
      token1ID: PromiseOrValue<string>,
      amount0In: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: CallOverrides
    ): Promise<void>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    checkOwner(overrides?: CallOverrides): Promise<BigInt>;

    flashSwap(
      loanFactory: PromiseOrValue<string>,
      recipientRouter: PromiseOrValue<string>,
      token0ID: PromiseOrValue<string>,
      token1ID: PromiseOrValue<string>,
      amount0In: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;
  };

  populateTransaction: {
    checkOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    flashSwap(
      loanFactory: PromiseOrValue<string>,
      recipientRouter: PromiseOrValue<string>,
      token0ID: PromiseOrValue<string>,
      token1ID: PromiseOrValue<string>,
      amount0In: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
