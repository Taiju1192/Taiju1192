// commands/google.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  name: 'google-reaction',
  async handle(message, client) {
    // 「○○とは」が含まれているメッセージを監視
    const match = message.content.match(/(.+?)とは/);
    if (!match) return;

    const query = match[1].trim();
    const emoji = '🔍';

    try {
      // 🔍リアクションを追加
      const reaction = await message.react(emoji);

      // リアクションを待機
      const filter = (reaction, user) => {
        return reaction.emoji.name === emoji && !user.bot;
      };

      const collector = message.createReactionCollector({ filter, max: 1, time: 30000 });

      collector.on('collect', async () => {
        const results = await googleSearch(query);

        if (!results || results.length === 0) {
          return message.reply('検索結果が見つかりませんでした。');
        }

        const first = results[0];

        const embed = new EmbedBuilder()
          .setTitle(first.title)
          .setURL(first.link)
          .setDescription(first.snippet || '説明はありません。')
          .setColor(0x4285F4)
          .setFooter({ text: `検索ワード: ${query}` });

        message.reply({ embeds: [embed] });
      });
    } catch (err) {
      console.error('リアクションエラー:', err);
    }
  },
};

// 🔍 Google検索関数
async function googleSearch(query) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.items || [];
  } catch (err) {
    console.error('Google検索エラー:', err);
    return [];
  }
}
