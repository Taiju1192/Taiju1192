const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const ALLOWED_USER = '1365228588261052499';
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('upload')
    .setDescription('ファイルをアップロードします（開発者専用）')
    .addAttachmentOption(option =>
      option
        .setName('file')
        .setDescription('アップロードするファイル')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== ALLOWED_USER) {
      return interaction.reply({ content: '❌ あなたにはこのコマンドの実行権限がありません。', ephemeral: true });
    }

    const file = interaction.options.getAttachment('file');
    const ext = path.extname(file.name);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    try {
      const response = await fetch(file.url);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      const embed = new EmbedBuilder()
        .setTitle('✅ ファイルアップロード成功')
        .addFields(
          { name: 'ファイル名', value: file.name, inline: true },
          { name: 'サイズ', value: `${(file.size / 1024).toFixed(2)} KB`, inline: true },
          { name: '保存先', value: `\`data/uploads/${fileName}\`` }
        )
        .setColor('Green')
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Upload failed:', error);
      await interaction.reply({ content: '❌ ファイルの保存中にエラーが発生しました。', ephemeral: true });
    }
  },
};
