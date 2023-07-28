/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  Flash,
  FlashInterface,
} from "../../../contracts/flashContract.sol/Flash";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token0ID",
        type: "address",
      },
      {
        internalType: "address",
        name: "token1ID",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount0In",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount1Out",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_loanFactory",
        type: "address",
      },
      {
        internalType: "address",
        name: "_recipientRouter",
        type: "address",
      },
    ],
    name: "flashSwap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount0",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_amount1",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "uniswapV2Call",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610f87380380610f878339818101604052602081101561003357600080fd5b5051600080546001600160a01b039092166001600160a01b0319909216919091179055610f22806100656000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806310d1e85c1461003b57806316513ccd146100c9575b600080fd5b6100c76004803603608081101561005157600080fd5b6001600160a01b03823516916020810135916040820135919081019060808101606082013564010000000081111561008857600080fd5b82018360208201111561009a57600080fd5b803590602001918460018302840111640100000000831117156100bc57600080fd5b509092509050610113565b005b6100c7600480360360c08110156100df57600080fd5b506001600160a01b0381358116916020810135821691604082013591606081013591608082013581169160a001351661062b565b604080516002808252606080830184529260208301908036833701905050905060008383602081101561014557600080fd5b5060408051630dfe168160e01b81529051913592506000913391630dfe1681916004808301926020929190829003018186803b15801561018457600080fd5b505afa158015610198573d6000803e3d6000fd5b505050506040513d60208110156101ae57600080fd5b50516040805163d21220a760e01b81529051919250600091339163d21220a7916004808301926020929190829003018186803b1580156101ed57600080fd5b505afa158015610201573d6000803e3d6000fd5b505050506040513d602081101561021757600080fd5b5051600154909150610233906001600160a01b031683836108a1565b6001600160a01b0316336001600160a01b031614610287576040805162461bcd60e51b815260206004820152600c60248201526b155b985d5d1a1bdc9a5e995960a21b604482015290519081900360640190fd5b871580610292575086155b61029b57600080fd5b81846000815181106102a957fe5b60200260200101906001600160a01b031690816001600160a01b03168152505080846001815181106102d757fe5b6001600160a01b039283166020918202929092018101919091526002546040805163095ea7b360e01b8152918416600483015260248201879052518493603c4201939085169263095ea7b392604480830193928290030181600087803b15801561034057600080fd5b505af1158015610354573d6000803e3d6000fd5b505050506040513d602081101561036a57600080fd5b5050600154600090610386906001600160a01b03168789610961565b60008151811061039257fe5b602002602001015190506000600260009054906101000a90046001600160a01b03166001600160a01b03166338ed173988848b33886040518663ffffffff1660e01b81526004018086815260200185815260200180602001846001600160a01b03166001600160a01b03168152602001838152602001828103825285818151815260200191508051906020019060200280838360005b83811015610440578181015183820152602001610428565b505050509050019650505050505050600060405180830381600087803b15801561046957600080fd5b505af115801561047d573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405260208110156104a657600080fd5b81019080805160405193929190846401000000008211156104c657600080fd5b9083019060208201858111156104db57600080fd5b82518660208202830111640100000000821117156104f857600080fd5b82525081516020918201928201910280838360005b8381101561052557818101518382015260200161050d565b5050505090500160405250505060018151811061053e57fe5b6020026020010151905081811161059c576040805162461bcd60e51b815260206004820152601a60248201527f696e73756666696369656e74206f757470757420616d6f756e74000000000000604482015290519081900360640190fd5b6040805163a9059cbb60e01b81526001600160a01b038f81166004830152848403602483015291519186169163a9059cbb916044808201926020929091908290030181600087803b1580156105f057600080fd5b505af1158015610604573d6000803e3d6000fd5b505050506040513d602081101561061a57600080fd5b505050505050505050505050505050565b6000546001600160a01b0316331461068a576040805162461bcd60e51b815260206004820152601f60248201527f4f6e6c79206f776e65722063616e207570646174652061646472657373657300604482015290519081900360640190fd5b600180546001600160a01b038085166001600160a01b031992831617909255600280548484169216919091179055600080549091339116146106fd5760405162461bcd60e51b8152600401808060200182810382526021815260200180610e536021913960400191505060405180910390fd5b6001546040805163e6a4390560e01b81526001600160a01b038a8116600483015289811660248301529151919092169163e6a43905916044808301926020929190829003018186803b15801561075257600080fd5b505afa158015610766573d6000803e3d6000fd5b505050506040513d602081101561077c57600080fd5b5051600154600254604080516001600160a01b039384166020828101919091529284168183015260608181018b90528251808303909101815260808083019384905263022c0d9f60e01b90935260006084830181815260a484018c90523060c4850181905260e485019586528351610104860152835198995092979689169663022c0d9f9692958d958a949192610124909101918501908083838b5b83811015610830578181015183820152602001610818565b50505050905090810190601f16801561085d5780820380516001836020036101000a031916815260200191505b5095505050505050600060405180830381600087803b15801561087f57600080fd5b505af1158015610893573d6000803e3d6000fd5b505050505050505050505050565b60008060006108b08585610aae565b604080516bffffffffffffffffffffffff19606094851b811660208084019190915293851b81166034830152825160288184030181526048830184528051908501206001600160f81b031960688401529a90941b9093166069840152607d8301989098527f96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f609d808401919091528851808403909101815260bd909201909752805196019590952095945050505050565b60606002825110156109ba576040805162461bcd60e51b815260206004820152601e60248201527f556e697377617056324c6962726172793a20494e56414c49445f504154480000604482015290519081900360640190fd5b815167ffffffffffffffff811180156109d257600080fd5b506040519080825280602002602001820160405280156109fc578160200160208202803683370190505b5090508281600183510381518110610a1057fe5b60209081029190910101528151600019015b8015610aa657600080610a5f87866001860381518110610a3e57fe5b6020026020010151878681518110610a5257fe5b6020026020010151610b8c565b91509150610a81848481518110610a7257fe5b60200260200101518383610c5a565b846001850381518110610a9057fe5b6020908102919091010152505060001901610a22565b509392505050565b600080826001600160a01b0316846001600160a01b03161415610b025760405162461bcd60e51b8152600401808060200182810382526025815260200180610ea06025913960400191505060405180910390fd5b826001600160a01b0316846001600160a01b031610610b22578284610b25565b83835b90925090506001600160a01b038216610b85576040805162461bcd60e51b815260206004820152601e60248201527f556e697377617056324c6962726172793a205a45524f5f414444524553530000604482015290519081900360640190fd5b9250929050565b6000806000610b9b8585610aae565b509050600080610bac8888886108a1565b6001600160a01b0316630902f1ac6040518163ffffffff1660e01b815260040160606040518083038186803b158015610be457600080fd5b505afa158015610bf8573d6000803e3d6000fd5b505050506040513d6060811015610c0e57600080fd5b5080516020909101516dffffffffffffffffffffffffffff91821693501690506001600160a01b0387811690841614610c48578082610c4b565b81815b90999098509650505050505050565b6000808411610c9a5760405162461bcd60e51b815260040180806020018281038252602c815260200180610e74602c913960400191505060405180910390fd5b600083118015610caa5750600082115b610ce55760405162461bcd60e51b8152600401808060200182810382526028815260200180610ec56028913960400191505060405180910390fd5b6000610d096103e8610cfd868863ffffffff610d4a16565b9063ffffffff610d4a16565b90506000610d236103e5610cfd868963ffffffff610db316565b9050610d406001828481610d3357fe5b049063ffffffff610e0316565b9695505050505050565b6000811580610d6557505080820282828281610d6257fe5b04145b610dad576040805162461bcd60e51b815260206004820152601460248201527364732d6d6174682d6d756c2d6f766572666c6f7760601b604482015290519081900360640190fd5b92915050565b80820382811115610dad576040805162461bcd60e51b815260206004820152601560248201527464732d6d6174682d7375622d756e646572666c6f7760581b604482015290519081900360640190fd5b80820182811015610dad576040805162461bcd60e51b815260206004820152601460248201527364732d6d6174682d6164642d6f766572666c6f7760601b604482015290519081900360640190fdfe4f6e6c79206f776e65722063616e2063616c6c20746869732066756e6374696f6e556e697377617056324c6962726172793a20494e53554646494349454e545f4f55545055545f414d4f554e54556e697377617056324c6962726172793a204944454e544943414c5f414444524553534553556e697377617056324c6962726172793a20494e53554646494349454e545f4c4951554944495459a264697066735822122026bd68923df433e766f72188710fd4440862d238bdf2ac30bcbaffd578c41c5d64736f6c63430006060033";

type FlashConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlashConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Flash__factory extends ContractFactory {
  constructor(...args: FlashConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _owner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Flash> {
    return super.deploy(_owner, overrides || {}) as Promise<Flash>;
  }
  override getDeployTransaction(
    _owner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_owner, overrides || {});
  }
  override attach(address: string): Flash {
    return super.attach(address) as Flash;
  }
  override connect(signer: Signer): Flash__factory {
    return super.connect(signer) as Flash__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlashInterface {
    return new utils.Interface(_abi) as FlashInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Flash {
    return new Contract(address, _abi, signerOrProvider) as Flash;
  }
}
