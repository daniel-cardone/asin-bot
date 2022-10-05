"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commands = __importStar(require("./commands"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bot = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
    ],
});
bot.on("ready", async () => {
    const rest = new discord_js_1.REST({ version: "10" }).setToken(process.env.TOKEN);
    const slashCommandRegisterResult = await rest.put(discord_js_1.Routes.applicationCommands(bot.user.id), { body: Object.values(commands).map((command) => command.command.toJSON()) });
    console.log(`Loaded ${slashCommandRegisterResult.length} slash commands.`);
    console.log(`${bot.user?.username} ready. Serving ${bot.guilds.cache.size} servers.`);
});
bot.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand())
        return;
    const command = commands[interaction.commandName];
    if (!command)
        return;
    await command.handler(interaction);
});
bot.login(process.env.TOKEN);
