const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('プロフィール画像を表示')
    .addUserOption(opt =>
      opt.setName('ユーザー')
        .setDescription('表示したいユーザー')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('ユーザー') || interaction.user;

    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 512 });

    const embed = new EmbedBuilder()
      .setTitle('🖼️ アバター表示')
      .setImage(avatarURL)
      .setColor(0x7289da)
      .setFooter({ text: `ユーザー → ${user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};
