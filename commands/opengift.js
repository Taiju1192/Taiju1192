const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('opengift')
    .setDescription('公開配布を作成します'),
  
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('opengift-modal')
      .setTitle('公開配布のタイプを選択');

    const typeInput = new TextInputBuilder()
      .setCustomId('gift-type')
      .setLabel('タイプを入力: url / text / file')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const valInput = new TextInputBuilder()
      .setCustomId('gift-value')
      .setLabel('URL or テキスト（ファイルなら空欄）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(typeInput),
      new ActionRowBuilder().addComponents(valInput)
    );

    await interaction.showModal(modal);
  }
};
