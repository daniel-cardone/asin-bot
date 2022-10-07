import {
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";
import Nightmare from "nightmare";
import { JSDOM } from "jsdom";

interface AmazonProduct {
  Title: string;
  Price: string;
  Image: string;
  [key: string]: string;
}

const queries: AmazonProduct = {
  Title: "#productTitle",
  Price: ".a-offscreen",
  Image: "#landingImage",
};

export default {
  command: (
    new SlashCommandBuilder()
      .setName("asin")
      .setDescription("Search a product on Amazon by ASIN")
      .addStringOption(option =>
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
      new Nightmare({ show: true })
        .useragent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36")
        .goto(`https://www.amazon.com/dp/${interaction.options.get("asin")?.value?.toString().trim()}`)
        .wait("body")
        .evaluate(() => window.document.body.innerHTML)
        .end()
    ) as string;

    const document = new JSDOM(result).window.document.body;
    const data: { [key: string]: string } = {};
    for (const key in queries) {
      const element = document.querySelector(queries[key]);
      if (element) {
        data[key] = element.textContent?.trim() || element.getAttribute("src") || "";
      }
    }
    
    await interaction.editReply({
      embeds: [
        {
          title: data.Title,
          url: `https://www.amazon.com/dp/${asin}`,
          description: data.Price,
          image: { url: data.Image },
        },
      ],
    });
  }
} as const;
