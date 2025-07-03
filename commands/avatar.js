const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("ユーザーのアバターを表示します")
    .addUserOption(option =>
      option.setName("user").setDescription("アバターを表示するユーザー")
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username} のアバター`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor("Blue")
      .setFooter({ text: `ID: ${user.id}` });

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};
