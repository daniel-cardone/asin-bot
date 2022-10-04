import { Client, GatewayIntentBits } from "discord.js";
import * as commands from "./commands";
import dotenv from "dotenv";
dotenv.config();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

bot.on("ready", () => {
  console.log(`${bot.user?.username} ready. Serving ${bot.guilds.cache.size} servers.`);
});

bot.login(process.env.TOKEN);
