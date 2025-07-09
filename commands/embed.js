const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('フォームでEmbedを作成')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('custom-embed-modal')
      .setTitle('📢 Embed 作成フォーム');

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
  }
};
