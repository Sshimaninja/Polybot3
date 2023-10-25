// import { ethers } from "ethers";
// import { config as dotEnvConfig } from "dotenv";
// import { deployedMap } from "./addresses";
// import { abi as IFlash } from '../artifacts/contracts/flashOne.sol/flashOne.json';

// dotEnvConfig();

// // /////////////////////////LIVE ENVIRONMENT/////////////////////////
// // export const flashwallet = process.env.FLASHWALLET;
// // export const randomWallet = ethers.Wallet.createRandom

// // // export const provider = new ethers.providers.JsonRpcProvider("https://polygon-mainnet.infura.io/v3/ae479bfaa1b54326a4770a0fe8aa801d")
// // // export const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${process.env.INFURA_POLYGON_ID}`)
// // // export const provider = new ethers.providers.WebSocketProvider(`wss://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_WSS_TOKEN}`);
// // // export const provider = new ethers.providers.JsonRpcProvider("http://65.109.125.21:8545/");
// // // export const provider = new ethers.providers.JsonRpcProvider(`https://rpc.ankr.com/polygon`);
// // export const provider = new ethers.providers.WebSocketProvider("ws://65.109.125.21:8546")
// // // export const provider = new ethers.providers.JsonRpcProvider("http://65.109.125.21:8545")
// // // export const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
// // // export const provider = new ethers.providers.WebSocketProvider("ws://localhost:8546")

// // if (process.env.PRIVATE_KEY === undefined) {
// //     throw new Error("Private key is not defined");
// // }


// // export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// // export const signer = wallet.connect(provider);

// // export const flash = new ethers.Contract(deployedMap.flashOne, IFlash, signer)
// // // export const flash = new ethers.Contract(deployedMap.flashTest, IFlash, wallet)


// /////////////////////////TEST ENVIRONMENT/////////////////////////




// export const flashwallet = process.env.TEST_WALLET;
// export const randomWallet = ethers.Wallet.createRandom

// export const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");

// if (process.env.TEST_KEY === undefined) {
//     throw new Error("Private key is not defined");
// }

// // export const private_key = process.env.PRIVATE_KEY;
// export const wallet = new ethers.Wallet(process.env.TEST_KEY, provider);
// export const signer = wallet.connect(provider);

// // const flash = new ethers.Contract(deployedMap.flashOne, IFlash, wallet)
// export const flash = new ethers.Contract(deployedMap.flashTest, IFlash, wallet)
