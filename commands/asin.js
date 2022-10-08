"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const nightmare_1 = __importDefault(require("nightmare"));
const jsdom_1 = require("jsdom");
const queries = {
    Title: "#productTitle",
    Price: ".a-offscreen",
    Image: "#landingImage",
};
exports.default = {
    command: (new discord_js_1.SlashCommandBuilder()
        .setName("asin")
        .setDescription("Search a product on Amazon by ASIN")
        .addStringOption(option => option
        .setName("asin")
        .setDescription("The ASIN of the product")
        .setRequired(true))),
    handler: async (interaction) => {
        await interaction.deferReply();
        const asin = interaction.options.get("asin")?.value?.toString().trim();
        if (!asin || asin.length !== 10) {
            await interaction.editReply("Invalid ASIN.");
            return;
        }
        const result = await (new nightmare_1.default()
            .useragent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36")
            .goto(`https://www.amazon.com/dp/${interaction.options.get("asin")?.value?.toString().trim()}`)
            .wait("body")
            .evaluate(() => window.document.body.innerHTML)
            .end());
        const document = new jsdom_1.JSDOM(result).window.document;
        const data = {};
        let error = false;
        for (const key in queries) {
            const element = document.querySelector(queries[key]);
            if (element) {
                data[key] = element.textContent?.trim() || element.getAttribute("src") || "";
            }
            else {
                error = true;
                break;
            }
        }
        if (error) {
            await interaction.editReply("Failed to fetch product data.");
            return;
        }
        await interaction.editReply({
            embeds: [
                {
                    color: 0x0080ff,
                    title: data.Title,
                    url: `https://www.amazon.com/dp/${asin}`,
                    description: data.Price,
                    image: { url: data.Image },
                },
            ],
        });
    }
};
