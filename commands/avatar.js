const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('プロフィール画像を表示する')
    .addUserOption(opt =>
      opt.setName('ユーザー')
        .setDescription('表示したいユーザー')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('ユーザー') || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle('🖼️ アバター表示')
      .setImage(user.displayAvatarURL({ size: 512, extension: 'png' }))
      .setColor(0x7289da)
      .setFooter({ text: `ユーザー → ${user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};
