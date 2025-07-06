const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");
const wordList = require("../data/English-word.js"); // 英単語1933語が入ったファイル

module.exports = {
  data: new SlashCommandBuilder()
    .setName("word-quiz")
    .setDescription("中学〜高校英単語から出題！意味（日本語）を当ててみよう！"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      // ランダムに英単語を1つ選択
      const word = wordList[Math.floor(Math.random() * wordList.length)];

      // dictionaryapi.dev で英語の意味を取得
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();

      const meaningEn = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
      if (!meaningEn) throw new Error("英語の意味取得に失敗");

      // LibreTranslate で日本語に翻訳（無料API）
      const translated = await fetch("https://translate.astian.org/translate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    q: meaningEn,
    source: "en",
    target: "ja",
    format: "text"
  })
});

const result = await translated.json();
const meaningJa = result?.translatedText || "翻訳できませんでした。";


      await interaction.editReply(`🧠 **${word}** の意味は何？\n||${meaningJa}||`);

    } catch (err) {
      console.error("❌ word-quiz エラー:", err);
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply("⚠️ 単語の取得または翻訳に失敗しました。");
      }
    }
  }
};
