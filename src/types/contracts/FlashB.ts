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
} from "../common";

export interface FlashBInterface extends utils.Interface {
  functions: {
    "flashSwap(address,address,uint256,uint256)": FunctionFragment;
    "owner()": FunctionFragment;
    "uniswapV2Call(address,uint256,uint256,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "flashSwap" | "owner" | "uniswapV2Call"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "flashSwap",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BigIntish>
    ]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "uniswapV2Call",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BigIntish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "flashSwap", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "uniswapV2Call",
    data: BytesLike
  ): Result;

  events: {};
}

export interface FlashB extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FlashBInterface;

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
    flashSwap(
      token0ID: PromiseOrValue<string>,
      token1ID: PromiseOrValue<string>,
      amount0In: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  flashSwap(
    token0ID: PromiseOrValue<string>,
    token1ID: PromiseOrValue<string>,
    amount0In: PromiseOrValue<BigIntish>,
    amount1Out: PromiseOrValue<BigIntish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  uniswapV2Call(
    _sender: PromiseOrValue<string>,
    _amount0: PromiseOrValue<BigIntish>,
    _amount1: PromiseOrValue<BigIntish>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    flashSwap(
      token0ID: PromiseOrValue<string>,
      token1ID: PromiseOrValue<string>,
      amount0In: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: CallOverrides
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;

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
    flashSwap(
      token0ID: PromiseOrValue<string>,
      token1ID: PromiseOrValue<string>,
      amount0In: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    owner(overrides?: CallOverrides): Promise<BigInt>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;
  };

  populateTransaction: {
    flashSwap(
      token0ID: PromiseOrValue<string>,
      token1ID: PromiseOrValue<string>,
      amount0In: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      _data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
