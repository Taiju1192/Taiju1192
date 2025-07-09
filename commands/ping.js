const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botの応答速度を表示'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 計測中...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiPing = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('📡 Ping 結果')
      .setColor(0x00bfff)
      .setDescription(`\`\`\`
Bot応答 → ${latency}ms
WebSocket → ${apiPing}ms
\`\`\``);

    await interaction.editReply({ content: '', embeds: [embed] });
  }
};
