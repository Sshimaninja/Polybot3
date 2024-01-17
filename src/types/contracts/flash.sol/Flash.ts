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

export interface FlashInterface extends utils.Interface {
  functions: {
    "flashSwap(address,address,uint256,uint256)": FunctionFragment;
    "uniswapV2Call(address,uint256,uint256,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "flashSwap" | "uniswapV2Call"
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
  decodeFunctionResult(
    functionFragment: "uniswapV2Call",
    data: BytesLike
  ): Result;

  events: {};
}

export interface Flash extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FlashInterface;

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
      _token0ID: PromiseOrValue<string>,
      _token1ID: PromiseOrValue<string>,
      amount0Out: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  flashSwap(
    _token0ID: PromiseOrValue<string>,
    _token1ID: PromiseOrValue<string>,
    amount0Out: PromiseOrValue<BigIntish>,
    amount1Out: PromiseOrValue<BigIntish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  uniswapV2Call(
    _sender: PromiseOrValue<string>,
    _amount0: PromiseOrValue<BigIntish>,
    _amount1: PromiseOrValue<BigIntish>,
    arg3: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    flashSwap(
      _token0ID: PromiseOrValue<string>,
      _token1ID: PromiseOrValue<string>,
      amount0Out: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: CallOverrides
    ): Promise<void>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    flashSwap(
      _token0ID: PromiseOrValue<string>,
      _token1ID: PromiseOrValue<string>,
      amount0Out: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigInt>;
  };

  populateTransaction: {
    flashSwap(
      _token0ID: PromiseOrValue<string>,
      _token1ID: PromiseOrValue<string>,
      amount0Out: PromiseOrValue<BigIntish>,
      amount1Out: PromiseOrValue<BigIntish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    uniswapV2Call(
      _sender: PromiseOrValue<string>,
      _amount0: PromiseOrValue<BigIntish>,
      _amount1: PromiseOrValue<BigIntish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
