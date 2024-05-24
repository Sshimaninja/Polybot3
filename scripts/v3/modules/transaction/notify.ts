//import { logger } from "../../../../constants/logger";
//import { Bool3Trade, Profit } from "../../../../constants/interfaces";
//import { tradeLogs } from "../tradeLog";
//import { Telegraf } from "telegraf";
//import { message } from "telegraf/filters";

//import { config as dotEnvConfig } from "dotenv";
//dotEnvConfig();

//const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
//const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

//export async function telegramInfo(message: string): Promise<void> {
//	try {
//		if (!TELEGRAM_BOT_TOKEN) {
//			throw new Error(
//				"Telegram bot token not found in environment variables",
//			);
//		}
//		if (!TELEGRAM_CHAT_ID) {
//			throw new Error(
//				"Telegram chat id not found in environment variables",
//			);
//		} else {
//			const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

//			bot.telegram
//				.sendMessage(TELEGRAM_CHAT_ID, message)
//				.then((sentMessage) => {
//					console.log(
//						"Telegram message sent: " + sentMessage.message_id,
//					);
//				})
//				.catch((error: any) => {
//					logger.error("TELEGRAM ERROR [telegramInfo()]: " + error);
//				});
//		}
//	} catch (error: any) {
//		logger.error("TELEGRAM ERROR [telegramInfo()]: " + error);
//		return;
//	}
//}

//export async function notify(trade: Bool3Trade) {
//	let logs = await tradeLogs(trade);
//	const message = `Trade ${trade.ticker} on ${(trade.loanPool.exchange, trade.target.exchange)
//		} is ongoing. Projected profit: ${trade.profits.WMATICProfit
//		} MATIC equivalent. \n\n`;
//	` ${JSON.stringify(logs.tinyData)}`;
//	try {
//		if (!TELEGRAM_BOT_TOKEN) {
//			throw new Error(
//				"Telegram bot token not found in environment variables",
//			);
//		}
//		if (!TELEGRAM_CHAT_ID) {
//			throw new Error(
//				"Telegram chat id not found in environment variables",
//			);
//		} else {
//			const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
//			const note = await bot.telegram.sendMessage(
//				TELEGRAM_CHAT_ID,
//				message,
//			);
//			const sent = note.message_id;
//			console.log("Telegram message sent: " + sent);
//		}
//	} catch (error: any) {
//		logger.error("TELEGRAM ERROR [notify()]: " + error.message);
//		return;
//	}
//}
