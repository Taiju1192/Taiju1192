const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  name: "google-reaction",

  async handle(message, client) {
    const match = message.content.match(/(.+?)とは/);
    if (!match) return;

    const query = match[1].trim();
    const emoji = '🔍';

    console.log(`💡 「${query}とは」を検出しました`);

    try {
      const reaction = await message.react(emoji);
      console.log("🔍 リアクションを追加しました");

      const collector = message.createReactionCollector({
        filter: (reaction, user) => reaction.emoji.name === emoji && !user.bot,
        max: 1,
        time: 30000
      });

      collector.on('end', async (collected, reason) => {
        if (collected.size === 0) {
          console.log("⏰ タイムアウト: リアクションされませんでした");
          return;
        }

        const user = collected.first().users.cache.filter(u => !u.bot).first();
        console.log(`✅ ${user.tag} がリアクションしました`);

        const results = await googleSearch(query);

        if (!results || results.length === 0) {
          console.log("❌ 検索結果が見つかりませんでした");
          return message.reply("検索結果が見つかりませんでした。");
        }

        // 上位3件まで取得（最大3）
        const topResults = results.slice(0, 3);

        const embeds = topResults.map((result, i) => {
          return new EmbedBuilder()
            .setTitle(`🔗 ${result.title}`)
            .setURL(result.link)
            .setDescription(result.snippet || "説明はありません。")
            .setColor(0x4285F4)
            .setFooter({ text: `検索ワード: ${query}｜${i + 1}件目` });
        });

        message.reply({ embeds });
      });

    } catch (err) {
      console.error("❌ エラーが発生しました:", err);
      message.reply("検索中にエラーが発生しました。");
    }
  }
};

// 🔍 Google検索関数（日本語限定）
async function googleSearch(query) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  // 🌐 日本の検索結果に限定（gl: 国、lr: 言語）
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}&gl=jp&lr=lang_ja`;

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
