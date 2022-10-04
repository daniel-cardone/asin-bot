"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = require("discord.js");
const bot = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
    ],
});
bot.on("ready", () => {
    var _a;
    console.log(`${(_a = bot.user) === null || _a === void 0 ? void 0 : _a.username} ready. Serving ${bot.guilds.cache.size} servers.`);
});
bot.login(process.env.TOKEN);
