const {
SlashCommandBuilder,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
ActionRowBuilder,
PermissionFlagsBits
} = require('discord.js');

module.exports = {
data: new SlashCommandBuilder()
.setName('embed')
.setDescription('フォームで埋め込みを作成')
.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

async execute(interaction) {
try {
const modal = new ModalBuilder()
.setCustomId('custom-embed-modal')
.setTitle('📢 Embed 作成フォーム');

javascript
コピーする
編集する
  const titleInput = new TextInputBuilder()
    .setCustomId('embed-title')
    .setLabel('タイトル（必須）')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const descInput = new TextInputBuilder()
    .setCustomId('embed-description')
    .setLabel('説明（省略可）')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);

  const row1 = new ActionRowBuilder().addComponents(titleInput);
  const row2 = new ActionRowBuilder().addComponents(descInput);

  modal.addComponents(row1, row2);
  await interaction.showModal(modal);
} catch (error) {
  console.error('❌ /embed エラー:', error);

  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content: '⚠️ モーダルの表示中にエラーが発生しました。',
      flags: 1 << 6
    });
  }
}
}
};
