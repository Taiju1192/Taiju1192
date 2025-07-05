const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");
const wordList = require("../data/wordlist.json"); // ← 1933語読み込み

module.exports = {
  data: new SlashCommandBuilder()
    .setName("word-quiz")
    .setDescription("中学〜高校英単語から出題！意味を当てよう！"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const word = wordList[Math.floor(Math.random() * wordList.length)];

      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();

      const meaning = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
      if (!meaning) throw new Error("意味取得失敗");

      await interaction.editReply(`🧠 **${word}** の意味は？\n||${meaning}||`);
    } catch (err) {
      console.error("❌ word-quiz エラー:", err);
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply("⚠️ 単語の取得に失敗しました。");
      }
    }
  }
};
