const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('ユーザー情報を表示')
    .addUserOption(opt =>
      opt.setName('ターゲット')
        .setDescription('情報を表示するユーザー')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('ターゲット') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const embed = new EmbedBuilder()
      .setTitle('🙋‍♂️ ユーザー情報')
      .setColor(0x9b59b6)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(`\`\`\`
ユーザー → ${user.tag}
ユーザーID → ${user.id}
アカウント作成 → ${user.createdAt.toLocaleString()}
サーバー参加日 → ${member.joinedAt.toLocaleString()}
\`\`\``);

    await interaction.reply({ embeds: [embed] });
  }
};
