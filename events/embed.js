// commands/embed.js
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('カスタム埋め込みメッセージを送信'),

  async execute(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('custom-embed-modal')
        .setTitle('📝 埋め込みメッセージ作成');

      const titleInput = new TextInputBuilder()
        .setCustomId('embed-title')
        .setLabel('タイトル（必須）')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const descInput = new TextInputBuilder()
        .setCustomId('embed-description')
        .setLabel('説明文（任意）')
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
          content: '⚠️ 埋め込み送信中にエラーが発生しました。',
          flags: 1 << 6
        });
      }
    }
  }
};

// events/embed.js
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'custom-embed-modal') return;

    try {
      const title = interaction.fields.getTextInputValue('embed-title');
      const description = interaction.fields.getTextInputValue('embed-description') || '（説明なし）';

      const embed = new EmbedBuilder()
        .setColor(0x00bfff)
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: `作成者 → ${interaction.user.tag}` });

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error('❌ モーダル処理エラー:', err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ モーダル送信中にエラーが発生しました。',
          flags: 1 << 6
        });
      }
    }
  }
};
