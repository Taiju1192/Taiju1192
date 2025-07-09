const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('このサーバーの情報を表示します'),

  async execute(interaction) {
    const { guild } = interaction;
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle('📊 サーバー情報')
      .setColor(0x3498db)
      .setDescription(`\`\`\`
サーバー名       → ${guild.name}
サーバーID       → ${guild.id}
作成日           → ${guild.createdAt.toLocaleString()}
オーナー         → ${owner.user.tag}
メンバー数       → ${guild.memberCount}
チャンネル数     → ${guild.channels.cache.size}
\`\`\``)
      .setThumbnail(guild.iconURL({ size: 256 }));

    await interaction.reply({ embeds: [embed] });
  }
};
