import TelegramBot from "node-telegram-bot-api";
import { env } from "../config/env.js";

let bot = null;

function getBot() {
  if (!env.telegram.token) {
    return null;
  }
  if (!bot) {
    bot = new TelegramBot(env.telegram.token, { polling: false });
  }
  return bot;
}

export async function sendTelegramMessage(message) {
  const botInstance = getBot();
  if (!botInstance || !env.telegram.defaultChatId) {
    return;
  }
  await botInstance.sendMessage(env.telegram.defaultChatId, message);
}
