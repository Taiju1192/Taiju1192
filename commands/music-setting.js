const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music-setting")
    .setDescription("音楽再生の設定を変更します"),

  async execute(interaction) {
    try {
      const menu = new StringSelectMenuBuilder()
        .setCustomId("music_settings")
        .setPlaceholder("オプションを選択してください")
        .addOptions([
          { label: "音量を変更", value: "volume", emoji: "🔊" },
          { label: "リピート切替", value: "repeat", emoji: "🔁" },
          { label: "キューをシャッフル", value: "shuffle", emoji: "🔀" },
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        content: "🎵 設定を選択してください：",
        components: [row],
        ephemeral: true
      });
    } catch (err) {
      console.error("❌ music-setting.js エラー:", err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "⚠ エラーが発生しました。", ephemeral: true });
      } else {
        await interaction.reply({ content: "⚠ エラーが発生しました。", ephemeral: true });
      }
    }
  }
};
