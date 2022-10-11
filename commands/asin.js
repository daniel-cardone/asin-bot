"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const nightmare_1 = __importDefault(require("nightmare"));
const jsdom_1 = require("jsdom");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const KEEPA_KEY = process.env.KEEPA;
function keepaUrl(route, asin) {
    return `https://api.keepa.com/${route}?key=${KEEPA_KEY}&domain=1&asin=${asin}`;
}
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
        let error = false;
        let attachments = [];
        let images = [];
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
            .end()
            .then(res => res)
            .catch(() => error = true));
        const data = { fields: [] };
        if (!error) {
            const document = new jsdom_1.JSDOM(result).window.document;
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
            if (data.Image)
                images.push(data.Image);
        }
        // if (!error) {
        //   const keepaGraph = (await axios.get(keepaUrl("graphimage", asin))).data;
        //   const graphBuffer = Buffer.from(keepaGraph, "binary");
        //   attachments.push({ name: "keepagraph.png", attachment: graphBuffer, description: "" });
        //   images.push("attachment://keepagraph.png");
        //   for (let type of ['ascii', 'utf8', 'utf-8', 'utf16le', 'ucs2', 'ucs-2', 'base64', 'base64url', 'latin1', 'binary', 'hex']) {
        //     writeFileSync(`debug/keepagraph=${type}.png`, Buffer.from(keepaGraph, type as BufferEncoding));
        //   }
        //   writeFileSync("debug/keepagraph.png", keepaGraph)
        // }
        if (!error) {
            const keepaProduct = (await axios_1.default.get(keepaUrl("product", asin))).data.products[0];
            let availability = "No offer exists.";
            switch (keepaProduct.availabilityAmazon) {
                case 0:
                    availability = "In Stock and shippable";
                    break;
                case 1:
                    availability = "Not in stock, but will be in the future. (Pre-order)";
                    break;
                case 2:
                    availability = "Unknown";
                    break;
                case 3:
                    availability = "Not in stock, but will be in the future. (Back-order)";
                    break;
                case 4:
                    availability = "Amazon shipping is delayed";
                    break;
            }
            console.log(keepaProduct.salesRanks);
            data.fields.push({
                name: "Availability",
                value: availability
            });
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
                    fields: data.fields,
                },
                ...images.map(img => ({ url: embedURL, image: { url: img } }))
            ],
        });
    }
};
