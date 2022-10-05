"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
exports.default = {
    name: "asin",
    command: new discord_js_1.SlashCommandBuilder()
        .setName("asin")
        .setDescription("Search a product on Amazon by ASIN"),
    handler: async (interaction) => {
        await interaction.reply("Hello World!");
    }
};
