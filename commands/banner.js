const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('プロフィール背景（バナー）画像を表示')
    .addUserOption(opt =>
      opt.setName('ユーザー')
        .setDescription('対象ユーザー')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('ユーザー') || interaction.user;
    const userData = await interaction.client.users.fetch(user.id, { force: true });

    if (!userData.banner) {
      return interaction.reply({
        content: '❌ このユーザーはバナー画像を設定していません。',
        ephemeral: true
      });
    }

    const bannerURL = userData.bannerURL({ size: 1024 });

    const embed = new EmbedBuilder()
      .setTitle('🎨 プロフィール背景（バナー）')
      .setImage(bannerURL)
      .setColor(0x1abc9c)
      .setFooter({ text: `ユーザー → ${user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};
