const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  AttachmentBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const ALLOWED_USER = '1365228588261052499';
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deuprode')
    .setDescription('アップロード済みファイルを表示・削除（開発者専用）'),

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
      .setCustomId('select_file')
      .setPlaceholder('表示・削除するファイルを選択')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(select);

    const embed = new EmbedBuilder()
      .setTitle('📂 アップロードファイル一覧')
      .setDescription('表示または削除したいファイルを選んでください。')
      .setColor('Blue');

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

    const msg = await interaction.fetchReply();

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    collector.on('collect', async sel => {
      if (sel.user.id !== interaction.user.id) {
        return sel.reply({ content: '❌ あなたは操作できません。', ephemeral: true });
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
        .setTitle('📄 ファイル表示 / 削除確認')
        .addFields({ name: 'ファイル名', value: `\`${selectedFile}\`` })
        .setColor('Yellow')
        .setTimestamp();

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_delete')
          .setLabel('🗑 削除する')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('キャンセル')
          .setStyle(ButtonStyle.Secondary)
      );

      if (isImage) {
        const attachment = new AttachmentBuilder(buffer, { name: selectedFile });
        previewEmbed.setImage(`attachment://${selectedFile}`);
        await sel.reply({ embeds: [previewEmbed], files: [attachment], components: [actionRow], ephemeral: true });
      } else if (isText) {
        const content = buffer.toString('utf-8').slice(0, 1900);
        previewEmbed.addFields({ name: '内容（先頭）', value: `\`\`\`\n${content}\n\`\`\`` });
        await sel.reply({ embeds: [previewEmbed], components: [actionRow], ephemeral: true });
      } else {
        previewEmbed.addFields({ name: '📎 添付', value: 'この形式は埋め込み表示できません。' });
        const attachment = new AttachmentBuilder(buffer, { name: selectedFile });
        await sel.reply({ embeds: [previewEmbed], files: [attachment], components: [actionRow], ephemeral: true });
      }

      const btnCollector = sel.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30_000
      });

      btnCollector.on('collect', async btn => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: '❌ あなたは実行できません。', ephemeral: true });
        }

        if (btn.customId === 'confirm_delete') {
          try {
            fs.unlinkSync(filePath);

            const resultEmbed = new EmbedBuilder()
              .setTitle('🗑 削除成功')
              .setDescription(`ファイル \`${selectedFile}\` を削除しました。`)
              .setColor('Red')
              .setTimestamp();

            await btn.update({ embeds: [resultEmbed], components: [] });
          } catch (err) {
            await btn.reply({ content: `❌ 削除失敗: ${err.message}`, ephemeral: true });
          }
          btnCollector.stop();
        }

        if (btn.customId === 'cancel') {
          await btn.update({
            content: '✅ 削除をキャンセルしました。',
            embeds: [],
            components: []
          });
          btnCollector.stop();
        }
      });
    });
  }
};
