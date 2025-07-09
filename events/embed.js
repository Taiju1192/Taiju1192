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
