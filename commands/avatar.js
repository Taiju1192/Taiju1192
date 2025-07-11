// commands/avatar.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('ユーザーのプロフィール画像を表示')
    .addUserOption(option =>
      option.setName('ユーザー').setDescription('表示したいユーザー')),

  async execute(interaction) {
    try {
      const target = interaction.options.getUser('ユーザー') || interaction.user;

      const embed = new EmbedBuilder()
        .setTitle('🖼️ アバター表示')
        .setColor(0x00bfff)
        .setImage(target.displayAvatarURL({ size: 512, dynamic: true }))
        .setFooter({ text: `ユーザー → ${target.tag}` });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('❌ avatarコマンドでエラー:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ アバター表示中にエラーが発生しました。',
          flags: 1 << 6 // ephemeral
        });
      }
    }
  }
};
