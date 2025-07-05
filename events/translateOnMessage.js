const { Events } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (!message.author.bot) return;
    if (!message.content.startsWith("🧠") || !message.content.includes("||")) return;

    const match = message.content.match(/\|\|(.+?)\|\|/);
    if (!match) return;

    const englishDefinition = match[1];

    try {
      const response = await fetch("https://translate.astian.org/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: englishDefinition,
          source: "en",
          target: "ja",
          format: "text"
        }),
      });

      const data = await response.json();
      if (!data.translatedText) throw new Error("翻訳データなし");

      await message.reply(`🈯 日本語訳: **${data.translatedText}**`);

    } catch (err) {
      console.error("❌ 翻訳エラー:", err);
    }
  }
};
