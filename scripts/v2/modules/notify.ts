import { logger } from '../../../constants/contract';
import { BoolTrade, Profit } from '../../../constants/interfaces';
import { tradeLogs } from './tradeLog';
import TelegramBot from 'node-telegram-bot-api';
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const TELEGRAM_BOT_TOKEN = process.env.telegramApiKey;
const TELEGRAM_CHAT_ID = process.env.telegramChatId;








export async function telegramInfo(message: string): Promise<void> {

    try {

        if (!TELEGRAM_BOT_TOKEN) {
            throw new Error('Telegram bot token not found in environment variables');
        }
        if (!TELEGRAM_CHAT_ID) {
            throw new Error('Telegram chat id not found in environment variables');
        } else {

            const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
            const note = await bot.sendMessage(TELEGRAM_CHAT_ID, message);
            const sent = note.message_id;
            console.log("Telegram message sent: " + sent)

        }
    } catch (error: any) {
        logger.error("TELEGRAM ERROR: " + error.message);
        return;
    }
}

export async function notify(trade: BoolTrade, profit: Profit) {

    try {

        if (!TELEGRAM_BOT_TOKEN) {
            throw new Error('Telegram bot token not found in environment variables');
        }

        if (!TELEGRAM_CHAT_ID) {
            throw new Error('Telegram chat id not found in environment variables');
        } else {

            const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
            const logs = await tradeLogs(trade);
            logger.info("Sending BasicData to Telegram: " + Date.now());
            // Set up Telegram message
            const message = `Trade ${trade.ticker} is ongoing. Projected profit: ${profit.profit} MATIC equivalent. \n\n` + ` ${JSON.stringify(logs.basicData)}`;
            // Send Telegram message
            bot.sendMessage(TELEGRAM_BOT_TOKEN, message)

        }
    } catch (error: any) {
        logger.error("TELEGRAM ERROR: " + error.message);
        return;
    }
}
