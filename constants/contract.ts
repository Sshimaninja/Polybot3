import { ethers } from "ethers";
import { config as dotEnvConfig } from "dotenv";
import { abi as IFlashDirect } from '../artifacts/contracts//v2/flashDirect.sol/flashDirect.json';
import { abi as IFlashitMulti } from '../artifacts/contracts/v2/flashMulti.sol/flashMulti.json';

if (process.env.NODE_ENV === 'test') {
	dotEnvConfig({ path: '.env.test' });
} else { dotEnvConfig({ path: '.env.live' }) };



import * as log4js from "log4js";
log4js.configure({
	appenders: {
		flashit: { type: "file", filename: "flashit.log", layout: { type: "pattern", pattern: "%d %p %m" } },
		out: { type: "stdout", layout: { type: "pattern", pattern: "%d %p %[%m%]" } }
	},
	categories: { default: { appenders: ["flashit", "out"], level: "debug" } },
});

export const logger = log4js.getLogger();
// logger.level = "info";
logger.debug("Logging Debug");
logger.info("Logging Info");
logger.error("Logging Error");
logger.warn("Logging Warn");
logger.trace("Logging Trace");

const interval = 4 * 2000
// const inverval = provider.on('block', async (blockNumber: any) => {})



export const flashwallet = process.env.FLASHWALLET;
console.log("flashwallet: ", flashwallet)

const privateKey = process.env.PRIVATE_KEY;

const hetznerNode = process.env.HETZNER_NODE;
console.log('hetznerNode: ', hetznerNode)

const flashitMultiID = process.env.flashMulti;
console.log("flashitMultiID: ", flashitMultiID)
const flashDirectID = process.env.flashDirect;
console.log("flashDirectID: ", flashDirectID)


if (flashitMultiID === undefined) {
	throw new Error("flashitMultiID is not defined");
}
if (flashDirectID === undefined) {
	throw new Error("flashDirectID is not defined");
}

if (privateKey === undefined) {
	throw new Error("Private key is not defined");
}
if (hetznerNode === undefined) {
	throw new Error("hetznerNode is not defined");
}


export let provider: ethers.providers.Provider;

if (process.env.PROVIDER_TYPE === 'JsonRpcProvider') {
	console.log("Using JsonRpcProvider in TEST mode")
	provider = new ethers.providers.JsonRpcProvider(process.env.HETZNER_NODE);
	console.log("Provider working?: ", provider._isProvider)
} else if (process.env.PROVIDER_TYPE === 'WebSocketProvider') {
	console.log("Using WebSocketProvider in LIVE mode")
	if (process.env.HETZNER_NODE === undefined) {
		throw new Error("HETZNER_NODE is not defined");
	}
	provider = new ethers.providers.WebSocketProvider(process.env.HETZNER_NODE);
	console.log("Provider working?: ", provider._isProvider)
} else {
	throw new Error('Invalid provider type');
}



export const wallet = new ethers.Wallet(privateKey, provider);
export const signer = wallet.connect(provider);

export const flashDirect = new ethers.Contract(flashitMultiID, IFlashDirect, signer)
export const flashMulti = new ethers.Contract(flashitMultiID, IFlashitMulti, signer)
