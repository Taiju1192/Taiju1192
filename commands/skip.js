const { SlashCommandBuilder } = require("discord.js");
const activePlayers = require("../activePlayers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("現在の曲をスキップします"),

  async execute(interaction) {
    try {
      const guildId = interaction.guild?.id;
      const playerData = activePlayers.get(guildId);

      if (!playerData || !playerData.player) {
        return interaction.reply({
          content: "⚠️ 再生中の曲がありません。",
          ephemeral: true
        });
      }

      // 現在の曲を停止（次の曲へ）
      playerData.player.stop(true);

      await interaction.reply({
        content: "⏭ 曲をスキップしました。",
        ephemeral: true
      });
      
    } catch (error) {
      console.error("❌ /skip 実行中のエラー:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "⚠️ スキップ中にエラーが発生しました。",
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: "⚠️ スキップ中にエラーが発生しました。",
          ephemeral: true
        });
      }
    }
  }
};
