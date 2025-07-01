// commands/lyrics.js
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
        const json = JSON.parse(data);
        if (json.lyrics) resolve(json.lyrics);
        else reject('lyrics.ovh: 歌詞が見つかりませんでした。');
      });
    }).on('error', reject);
  });
};

const getLyricsFromSomeRandomAPI = (artist, title) => {
  return new Promise((resolve, reject) => {
    const url = `https://some-random-api.ml/lyrics?title=${encodeURIComponent(artist + ' ' + title)}`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.lyrics) resolve(json.lyrics);
        else reject('some-random-api: 歌詞が見つかりませんでした。');
      });
    }).on('error', reject);
  });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('アーティスト名と曲名から歌詞を表示します')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('アーティスト - 曲名 形式で入力')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const [artist, ...titleParts] = query.split('-');
    const title = titleParts.join('-').trim();

    if (!artist || !title) {
      return await interaction.reply({
        content: '❌ アーティスト - 曲名 の形式で入力してください。',
        flags: 1 << 6
      });
    }

    let lyrics = null;
    try {
      lyrics = await getLyricsFromOVH(artist.trim(), title);
    } catch (err1) {
      try {
        lyrics = await getLyricsFromSomeRandomAPI(artist.trim(), title);
      } catch (err2) {
        return await interaction.reply({ content: '❌ 歌詞を取得できませんでした。', flags: 1 << 6 });
      }
    }

    const chunks = lyrics.match(/(.|\n){1,3900}/g);
    let page = 0;

    const getMessage = (index) => {
      return {
        embeds: [
          new EmbedBuilder()
            .setTitle(`${title}`)
            .setDescription(chunks[index])
            .setColor(0x1DB954)
            .setFooter({ text: `ページ ${index + 1} / ${chunks.length}` })
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('⬅').setStyle(ButtonStyle.Secondary).setDisabled(index === 0),
            new ButtonBuilder().setCustomId('next').setLabel('➡').setStyle(ButtonStyle.Secondary).setDisabled(index === chunks.length - 1)
          )
        ]
      };
    };

    const msg = await interaction.reply({ ...getMessage(page), fetchReply: true });

    const collector = msg.createMessageComponentCollector({ time: 60000 });
    collector.on('collect', async i => {
      if (i.customId === 'prev') page--;
      else if (i.customId === 'next') page++;
      await i.update(getMessage(page));
    });
  }
};
