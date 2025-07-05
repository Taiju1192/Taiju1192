const { Events } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // ✅ 他のBotが送ったメッセージだけ対象
    if (!message.author.bot) return;

    // ✅ 特定フォーマットで始まるメッセージだけ処理
    if (!message.content.startsWith("🧠") || !message.content.includes("||")) return;

    // ✅ 英語定義部分（||...||）を抽出
    const match = message.content.match(/\|\|(.+?)\|\|/);
    if (!match) return;

    const englishDefinition = match[1];

    try {
      const response = await fetch("https://libretranslate.de/translate", {
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

      // ✅ 翻訳結果を返信
      await message.reply(`🈯 日本語訳: **${data.translatedText}**`);

    } catch (err) {
      console.error("❌ 翻訳エラー:", err);
    }
  }
};
