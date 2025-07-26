const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music-setting")
    .setDescription("音楽再生の設定を変更します"),

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: 64 }); // 非公開メッセージ

      const menu = new StringSelectMenuBuilder()
        .setCustomId("music_settings")
        .setPlaceholder("設定を選択してください")
        .addOptions([
          {
            label: "音量を変更",
            value: "volume",
            emoji: "🔊",
          },
          {
            label: "スピードを変更",
            value: "speed",
            emoji: "⏩",
          },
          {
            label: "リピート設定",
            value: "repeat",
            emoji: "🔁",
          },
          {
            label: "シャッフル設定",
            value: "shuffle",
            emoji: "🔀",
          },
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.editReply({
        content: "🎵 設定を選んでください：",
        components: [row],
      });
    } catch (err) {
      console.error("❌ music-setting.js エラー:", err);

      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({
            content: "⚠ 設定メニューの表示に失敗しました。",
            components: [],
          });
        } else {
          await interaction.reply({
            content: "⚠ 設定メニューの表示に失敗しました。",
            flags: 64,
          });
        }
      } catch (nestedErr) {
        console.warn("⚠ 二重応答を防止しました");
      }
    }
  },
};
