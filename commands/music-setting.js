const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music-setting")
    .setDescription("音楽再生の設定を変更します"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🎚 音楽設定メニュー")
      .setDescription("以下から設定を選んでください。")
      .setColor("Purple");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("music_settings")
      .setPlaceholder("設定を選択")
      .addOptions([
        { label: "音量調整", value: "volume" },
        { label: "リピート再生 ON/OFF", value: "repeat" },
        { label: "スピード調整", value: "speed" },
        { label: "シャッフル再生 ON/OFF", value: "shuffle" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
