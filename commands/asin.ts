import {
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";
import Nightmare from "nightmare";

export default {
  command: (
    new SlashCommandBuilder()
      .setName("asin")
      .setDescription("Search a product on Amazon by ASIN")
      .addStringOption((option) =>
        option
          .setName("asin")
          .setDescription("The ASIN of the product")
          .setRequired(true)
      )
  ),
  handler: async (interaction: ChatInputCommandInteraction | MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction) => {
    await interaction.deferReply();

    const asin = interaction.options.get("asin")?.value?.toString().trim();
    if (!asin || asin.length !== 10) {
      await interaction.editReply("Invalid ASIN.");
      return;
    }

    const result = await (
      new Nightmare()
        .useragent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36")
        .goto(`https://www.amazon.com/dp/${interaction.options.get("asin")?.value?.toString().trim()}`)
        .wait("body")
        .evaluate(() => document.querySelector("title")!.textContent)
        .end()
    ) as string;
    
    await interaction.editReply(result);
  }
} as const;
