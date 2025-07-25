const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const ALLOWED_USER = '1365228588261052499';
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uploaded')
    .setDescription('アップロードされたファイルの一覧を表示（開発者専用）'),

  async execute(interaction) {
    if (interaction.user.id !== ALLOWED_USER) {
      return interaction.reply({ content: '❌ このコマンドは開発者専用です。', ephemeral: true });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      return interaction.reply({ content: '📁 アップロードフォルダが存在しません。', ephemeral: true });
    }

    const files = fs.readdirSync(UPLOAD_DIR);
    if (files.length === 0) {
      return interaction.reply({ content: '📂 現在アップロードされたファイルはありません。', ephemeral: true });
    }

    const list = files.slice(-25).reverse().map((f, i) => `${i + 1}. \`${f}\``).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🗂 アップロード済みファイル一覧')
      .setDescription(list)
      .setColor('Blue')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
