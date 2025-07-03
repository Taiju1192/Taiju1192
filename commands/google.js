const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  name: "google-reaction",

  async handle(message, client) {
    // 「○○とは」という形式のメッセージを検出
    const match = message.content.match(/(.+?)とは/);
    if (!match) return;

    const query = match[1].trim();
    const emoji = '🔍';

    console.log(`💡 「${query}とは」を検出しました`);

    try {
      // 🔍 リアクション追加
      const reaction = await message.react(emoji);
      console.log("🔍 リアクションを追加しました");

      // リアクションの収集を開始（他ユーザーの反応を待つ）
      const collector = message.createReactionCollector({
        filter: (reaction, user) => reaction.emoji.name === emoji && !user.bot,
        max: 1,
        time: 30000 // 30秒でタイムアウト
      });

      collector.on('collect', async (reaction, user) => {
        console.log(`✅ ${user.tag} がリアクションしました`);

        // Googleで検索
        const results = await googleSearch(query);

        if (!results || results.length === 0) {
          console.log("❌ 検索結果が見つかりませんでした");
          return message.reply("検索結果が見つかりませんでした。");
        }

        const first = results[0];

        const embed = new EmbedBuilder()
          .setTitle(first.title)
          .setURL(first.link)
          .setDescription(first.snippet || "説明はありません。")
          .setColor(0x4285F4)
          .setFooter({ text: `検索ワード: ${query}` });

        message.reply({ embeds: [embed] });
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
          console.log("⏰ タイムアウト: リアクションされませんでした");
        }
      });

    } catch (err) {
      console.error("❌ エラーが発生しました:", err);
      message.reply("検索中にエラーが発生しました。");
    }
  }
};

// 🔍 Google検索関数
async function googleSearch(query) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  console.log(`🌐 Google検索API 呼び出しURL:\n${url}`);

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.items || json.items.length === 0) {
      console.log("🔍 Google検索結果: 空");
      return [];
    }

    console.log(`🔍 検索結果 ${json.items.length} 件取得`);
    return json.items;
  } catch (err) {
    console.error("❌ Google APIエラー:", err);
    return [];
  }
}
