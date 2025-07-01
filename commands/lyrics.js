const https = require('https');
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

const getLyricsFromOVH = (artist, title) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.lyrics) resolve(json.lyrics);
          else reject('lyrics.ovh: 歌詞が見つかりませんでした。');
        } catch (err) {
          reject('lyrics.ovh: 不正なレスポンス。');
        }
      });
    }).on('error', reject);
  });
};

const getLyricsFromSomeRandomAPI = (query) => {
  return new Promise((resolve, reject) => {
    const url = `https://some-random-api.ml/lyrics?title=${encodeURIComponent(query)}`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.lyrics) resolve({ lyrics: json.lyrics, title: json.title, author: json.author });
          else reject('some-random-api: 歌詞が見つかりませんでした。');
        } catch (err) {
          reject('some-random-api: 不正なレスポンス。');
        }
      });
    }).on('error', reject);
  });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('曲名または「アーティスト - 曲名」から歌詞を表示します')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('例: Aimer - Brave Shine または Brave Shine')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply(); // タイムアウト防止！

    const query = interaction.options.getString('query');
    let artist = null;
    let title = null;

    if (query.includes('-')) {
      const [rawArtist, ...titleParts] = query.split('-');
      artist = rawArtist.trim();
      title = titleParts.join('-').trim();
    } else {
      title = query.trim();
    }

    let lyrics = null;
    let finalTitle = title;
    let finalArtist = artist;

    try {
      if (artist && title) {
        lyrics = await getLyricsFromOVH(artist, title);
      } else {
        throw new Error('OVHスキップ：アーティスト情報不足');
      }
    } catch (err1) {
      console.warn('OVH失敗:', err1);
      try {
        const result = await getLyricsFromSomeRandomAPI(query);
        lyrics = result.lyrics;
        finalTitle = result.title;
        finalArtist = result.author;
      } catch (err2) {
        console.error('SomeRandomAPI失敗:', err2);
        return await interaction.editReply({ content: '❌ 歌詞を取得できませんでした。' });
      }
    }

    const chunks = lyrics.match(/(.|\n){1,3900}/g);
    let page = 0;

    const getMessage = (index) => {
      return {
        embeds: [
          new EmbedBuilder()
            .setTitle(finalTitle || 'タイトル不明')
            .setAuthor({ name: finalArtist || 'アーティスト不明' })
            .setDescription(chunks[index])
            .setColor(0x1DB954)
            .setFooter({ text: `ページ ${index + 1} / ${chunks.length}` })
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('⬅')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(index === 0),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('➡')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(index === chunks.length - 1)
          )
        ]
      };
    };

    const msg = await interaction.editReply({ ...getMessage(page), fetchReply: true });

    const collector = msg.createMessageComponentCollector({ time: 300000 }); // 5分
    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return await i.reply({ content: 'このボタンはあなた専用です。', ephemeral: true });
      }

      if (i.customId === 'prev') page--;
      else if (i.customId === 'next') page++;

      await i.update(getMessage(page));
    });

    collector.on('end', async () => {
      try {
        await msg.edit({ components: [] });
      } catch (e) {
        console.error('ボタン削除失敗:', e);
      }
    });
  }
};
