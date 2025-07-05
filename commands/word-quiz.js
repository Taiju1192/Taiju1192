const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("word-quiz")
    .setDescription("英単語の意味を当てよう！"),

  async execute(interaction) {
    try {
      // お好みで単語を追加可能！
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

      if (!meaning) {
        throw new Error("意味の取得に失敗しました");
      }

      await interaction.reply(`🧠 **${word}** の意味は？\n||${meaning}||`);
    } catch (err) {
      console.error("❌ word-quiz エラー:", err);
      await interaction.reply("⚠️ 単語の取得に失敗しました。もう一度試してみてください。");
    }
  }
};
