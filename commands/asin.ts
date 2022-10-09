import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";
import Nightmare from "nightmare";
import { JSDOM } from "jsdom";
import axios from "axios";
import { writeFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

interface AmazonProduct {
  Title: string;
  Price: string;
  Image: string;
  [key: string]: string;
}

const KEEPA_KEY = process.env.KEEPA!;

function keepaUrl(route: string, asin: string) {
  return `https://api.keepa.com/${route}?key=${KEEPA_KEY}&domain=com&asin=${asin}`;
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
    let error = false;
    let attachments = [];
    let images = [];
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
        .evaluate(() => window.document.body.innerHTML)
        .end()
        .then(res => res)
        .catch(() => error = true)
    ) as string;

    const data: { [key: string]: string } = {};
    if (!error) {
      const document = new JSDOM(result).window.document;
      for (const key in queries) {
        const element = document.querySelector(queries[key]);
        if (element) {
          data[key] = element.textContent?.trim() || element.getAttribute("src") || "";
        } else {
          error = true;
          break;
        }
      }

      //if (data.Image) images.push(data.Image);
    }

    if (!error) {
      const keepaGraph = (await axios.get(keepaUrl("graphimage", asin))).data;
      const graphBuffer = Buffer.from(keepaGraph, "binary");
      attachments.push({ name: "keepagraph.png", attachment: graphBuffer, description: "" });
      images.push("attachment://keepagraph.png");
      for (let type of ['ascii', 'utf8', 'utf-8', 'utf16le', 'ucs2', 'ucs-2', 'base64', 'base64url', 'latin1', 'binary', 'hex']) {
        writeFileSync(`debug/keepagraph=${type}.png`, Buffer.from(keepaGraph, type as BufferEncoding));
      }
      writeFileSync("debug/keepagraph.png", keepaGraph)
    }
    
    if (error || Object.keys(data).length === 0) {
      await interaction.editReply("Failed to fetch product data.");
      return;
    }
    
    const embedURL = `https://www.amazon.com/dp/${asin}`;
    await interaction.editReply({
      files: attachments,
      embeds: [
        {
          color: 0x0080ff,
          title: data.Title,
          url: embedURL,
          description: data.Price,
          image: {
            url: "attachment://keepagraph.png"
          }
        },
        // ...images.map(img => ({ url: embedURL, image: { url: img } }))
      ],
    });
  }
} as const;
