const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music-setting")
    .setDescription("音楽再生の設定を変更します"),

  async execute(interaction) {
    try {
      // deferReply は 3秒ルールの対策だが、使うなら必ず editReply に続けること
      await interaction.deferReply({ ephemeral: true });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("music_settings")
        .setPlaceholder("設定を選択してください")
        .addOptions([
          {
            label: "音量を変更",
            value: "volume",
            emoji: "🔊"
          },
          {
            label: "リピート切替",
            value: "repeat",
            emoji: "🔁"
          },
          {
            label: "キューをシャッフル",
            value: "shuffle",
            emoji: "🔀"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.editReply({
        content: "🎵 設定を選んでください：",
        components: [row]
      });

    } catch (err) {
      console.error("❌ music-setting.js エラー:", err);

      try {
        if (interaction.deferred) {
          await interaction.editReply({
            content: "⚠ 設定メニューの表示に失敗しました。",
            components: []
          });
        } else if (!interaction.replied) {
          await interaction.reply({
            content: "⚠ 設定メニューの表示に失敗しました。",
            ephemeral: true
          });
        }
      } catch (nestedErr) {
        console.warn("⚠ 二重応答を防止しました");
      }
    }
  }
};
