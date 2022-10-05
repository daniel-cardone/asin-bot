import {
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";


export default {
  name: "asin",
  command: new SlashCommandBuilder()
    .setName("asin")
    .setDescription("Search a product on Amazon by ASIN"),
  handler: async (interaction: ChatInputCommandInteraction | MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction) => {
    await interaction.reply("Hello World!");
  }
} as const;
