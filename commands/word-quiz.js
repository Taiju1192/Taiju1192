const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("word-quiz")
    .setDescription("英単語の意味を当てよう！"),

  async execute(interaction) {
    await interaction.deferReply(); // ✅ 最初に必ず応答予約

    try {
      const wordList = [
        "serendipity",
        "benevolent",
        "gregarious",
        "ephemeral",
        "meticulous",
        "ubiquitous",
        "melancholy"
      ];

      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();

      const meaning = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
      if (!meaning) throw new Error("意味取得失敗");

      // ✅ editReply に変更する
      await interaction.editReply(`🧠 **${word}** の意味は？\n||${meaning}||`);

    } catch (err) {
      console.error("❌ word-quiz エラー:", err);

      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply("⚠️ 単語の取得に失敗しました。");
      } else {
        console.warn("❌ 二重応答回避: 応答済みでした");
      }
    }
  }
};
