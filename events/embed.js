const { EmbedBuilder } = require('discord.js');

module.exports = {
name: 'interactionCreate',
async execute(interaction) {
if (!interaction.isModalSubmit()) return;
if (interaction.customId !== 'custom-embed-modal') return;

javascript
コピーする
編集する
try {
  const title = interaction.fields.getTextInputValue('embed-title');
  const description = interaction.fields.getTextInputValue('embed-description') || '';

  const embed = new EmbedBuilder()
    .setTitle(`📢 ${title}`)
    .setDescription(description ? `\`\`\`\n${description}\n\`\`\`` : '*（説明なし）*')
    .setColor(0xf1c40f)
    .setFooter({ text: `投稿者 → ${interaction.user.tag}` });

  await interaction.reply({ embeds: [embed] });
} catch (err) {
  console.error('❌ embed submit エラー:', err);
  if (!interaction.replied) {
    await interaction.reply({
      content: '⚠️ Embed の送信中にエラーが発生しました。',
      ephemeral: true
    });
  }
}
}
};
