import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import * as commands from "./commands";
import dotenv from "dotenv";
dotenv.config();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

bot.on("ready", async () => {
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);
  const slashCommandRegisterResult = await rest.put(
    Routes.applicationCommands(bot.user!.id),
    { body: Object.values(commands).map((command) => command.command.toJSON()) },
  );

  console.log(`Loaded ${(slashCommandRegisterResult as object[]).length} slash commands.`);

  console.log(`${bot.user?.username} ready. Serving ${bot.guilds.cache.size} servers.`);
});

bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands[interaction.commandName as keyof typeof commands];
  if (!command) return;

  await command.handler(interaction);
});

bot.login(process.env.TOKEN);
