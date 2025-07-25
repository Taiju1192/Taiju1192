const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const ALLOWED_USER = '1365228588261052499';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('JavaScriptコードを評価します（開発者専用）'),

  async execute(interaction) {
    if (interaction.user.id !== ALLOWED_USER) {
      return interaction.reply({ content: '❌ このコマンドは開発者専用です。', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId('eval_modal')
      .setTitle('💻 JavaScript 実行コード入力');

    const input = new TextInputBuilder()
      .setCustomId('eval_code')
      .setLabel('実行するJavaScriptコード（returnを含めると結果表示）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};
