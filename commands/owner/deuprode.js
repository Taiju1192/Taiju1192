const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  AttachmentBuilder,
  ComponentType
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const ALLOWED_USER = '1365228588261052499';
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deuprode')
    .setDescription('アップロード済みファイルを表示（開発者専用）'),

  async execute(interaction) {
    if (interaction.user.id !== ALLOWED_USER) {
      return interaction.reply({ content: '❌ このコマンドは開発者専用です。', ephemeral: true });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      return interaction.reply({ content: '📁 アップロードフォルダが存在しません。', ephemeral: true });
    }

    const files = fs.readdirSync(UPLOAD_DIR).slice(-25).reverse();
    if (files.length === 0) {
      return interaction.reply({ content: '📂 現在ファイルはありません。', ephemeral: true });
    }

    const options = files.map(f => ({
      label: f.length > 100 ? f.slice(0, 100) : f,
      value: f
    }));

    const select = new StringSelectMenuBuilder()
      .setCustomId('select_uploaded_file')
      .setPlaceholder('表示するファイルを選択')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setTitle('📁 アップロード済みファイル一覧')
      .setDescription('表示したいファイルを選択してください。')
      .setColor('Blue');

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const msg = await interaction.fetchReply();

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    collector.on('collect', async sel => {
      if (sel.user.id !== interaction.user.id) {
        return sel.reply({ content: '❌ あなたはこの操作を実行できません。', ephemeral: true });
      }

      const selectedFile = sel.values[0];
      const filePath = path.join(UPLOAD_DIR, selectedFile);

      if (!fs.existsSync(filePath)) {
        return sel.reply({ content: '❌ ファイルが存在しません。', ephemeral: true });
      }

      const buffer = fs.readFileSync(filePath);
      const isImage = /\.(png|jpe?g|gif|webp|bmp)$/i.test(selectedFile);
      const isText = /\.(txt|js|json|md|ts|log)$/i.test(selectedFile);

      const previewEmbed = new EmbedBuilder()
        .setTitle('📄 ファイル内容を表示')
        .addFields({ name: 'ファイル名', value: `\`${selectedFile}\`` })
        .setColor('Green')
        .setTimestamp();

      if (isImage) {
        const attachment = new AttachmentBuilder(buffer, { name: selectedFile });
        previewEmbed.setImage(`attachment://${selectedFile}`);
        await sel.reply({ embeds: [previewEmbed], files: [attachment], ephemeral: true });
      } else if (isText) {
        const content = buffer.toString('utf-8').slice(0, 1900); // Discordの制限に収める
        previewEmbed.addFields({ name: '内容（先頭）', value: `\`\`\`\n${content}\n\`\`\`` });
        await sel.reply({ embeds: [previewEmbed], ephemeral: true });
      } else {
        const attachment = new AttachmentBuilder(buffer, { name: selectedFile });
        previewEmbed.addFields({ name: '注意', value: 'このファイル形式は埋め込み表示されません。ダウンロードしてください。' });
        await sel.reply({ embeds: [previewEmbed], files: [attachment], ephemeral: true });
      }
    });
  }
};
