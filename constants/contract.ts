import { Provider, ethers } from "ethers";
import { config as dotEnvConfig } from "dotenv";
// import { abi as IflashMulti} from '../artifacts/contracts/v2/flashMulti.sol/flashMulti.json';
// import { abi as IflashDirect} from '../artifacts/contracts/v2/flashDirect.sol/flashDirect.json';
import { abi as IflashMultiTest } from '../artifacts/contracts/v2/flashMultiTest.sol/flashMultiTest.json';
import { abi as IflashDirectTest } from '../artifacts/contracts/v2/flashDirectTest.sol/flashDirectTest.json';
import { Logger } from "log4js";

import { configure, getLogger } from 'log4js';

configure({
  appenders: {
    file: { type: 'file', filename: 'app.log' },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['file', 'console'], level: 'debug' }
  }
});

export const logger = getLogger();
logger.level = 'debug'; // You can set this to whatever level you want

if (process.env.NODE_ENV === 'test') {
	dotEnvConfig({ path: '.env.test' });
} else { dotEnvConfig({ path: '.env.live' }) };

// ABIs:

// let flashMultiABI: any;
// let flashDirectABI: any;

// if (process.env.NODE_ENV === 'test') {
	let flashMultiABI = IflashMultiTest;
	let flashDirectABI = IflashDirectTest;
// } else {
// 	let flashMultiABI = IflashMulti;
// 	let flashDirectABI = IflashDirect;
// } 

// Addresses:

if (process.env.FLASH_MULTI && process.env.FLASH_DIRECT === undefined) {
	throw new Error("No flashMultiID set in .env file");
}
const flashMultiID = process.env.FLASH_MULTI;
const flashDirectID = process.env.FLASH_DIRECT; 

if (flashMultiID === undefined || flashDirectID === undefined) {
  throw new Error("No contract address set in .env file");
}

// Provider and Signer: (Can be changed to node when that is installed)

export const network = new ethers.Network('polygon', 137);

export const provider = new ethers.JsonRpcProvider(process.env.RPC, network, {
  staticNetwork: true,
});

if (process.env.PRIVATE_KEY === undefined) {
  throw new Error("No private key set in .env file");
}

export const flashwallet = process.env.FLASH_WALLET;



export const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
export const wallet: ethers.Signer = signer.connect(provider);

// Contracts:

export const flashMulti = new ethers.Contract(flashMultiID, flashMultiABI, signer);
export const flashDirect = new ethers.Contract(flashDirectID, flashDirectABI, signer);



