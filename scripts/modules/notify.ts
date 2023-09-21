import { logger } from '../../constants/contract';
import { BoolTrade, Profit } from '../../constants/interfaces';
import { tradeLogs } from './tradeLog';
import TelegramBot from 'node-telegram-bot-api';
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const telegramApiKey = process.env.telegramApiKey;
export async function notify(trade: BoolTrade, profit: Profit) {

    if (!telegramApiKey) {
        throw new Error('Telegram API key not found in environment variables');
    } else {

        const bot = new TelegramBot(telegramApiKey, { polling: false });


        const logs = await tradeLogs(trade);
        logger.info("Sending Notification (BasicData): " + Date.now());

        // Set up Telegram message
        const message = `Trade ${trade.ticker} is ongoing. Current profit: ${profit.profit} MATIC. \n\n` + ` ${JSON.stringify(logs.basicData)}`;

        // Send Telegram message
        bot.sendMessage(telegramApiKey, message)
            .then(() => console.log('Telegram notification sent'))
            .catch((error: any) => console.error(error));
    }
}