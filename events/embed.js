const { EmbedBuilder } = require('discord.js');

module.exports = {
name: 'interactionCreate',
async execute(interaction) {
if (!interaction.isModalSubmit()) return;
if (interaction.customId !== 'custom-embed-modal') return;
try {
  const title = interaction.fields.getTextInputValue('embed-title');
  const description = interaction.fields.getTextInputValue('embed-description') || '';

  const embed = new EmbedBuilder()
    .setTitle(`📢 ${title}`)
    .setDescription(description ? `\`\`\`\n${description}\n\`\`\`` : '*（説明なし）*')
    .setColor(0xf1c40f)
    .setFooter({ text: `投稿者 → ${interaction.user.tag}` });

  await interaction.reply({ embeds: [embed] });
} catch (error) {
  console.error('❌ モーダル送信エラー:', error);

  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({
      content: '⚠️ Embed の送信中にエラーが発生しました。',
      flags: 1 << 6
    });
  }
}
}
};
