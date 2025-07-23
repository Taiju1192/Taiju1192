const { SlashCommandBuilder } = require("discord.js");
const activePlayers = require("../activePlayers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("音楽再生を停止し、ボイスチャンネルから退出します"),

  async execute(interaction) {
    try {
      const guildId = interaction.guild?.id;
      if (!guildId) {
        return interaction.reply({
          content: "❌ サーバー情報を取得できませんでした。",
          ephemeral: true
        });
      }

      const playerData = activePlayers.get(guildId);
      if (!playerData || !playerData.player || !playerData.connection) {
        return interaction.reply({
          content: "⚠️ 現在再生中の曲はありません。",
          ephemeral: true
        });
      }

      // 停止と接続解除
      playerData.player.stop();
      playerData.connection.destroy();
      activePlayers.delete(guildId);

      await interaction.reply({
        content: "⏹️ 再生を停止し、ボイスチャンネルから退出しました。",
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ /stop 実行中のエラー:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "⚠️ エラーが発生しました。再生を停止できませんでした。",
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: "⚠️ エラーが発生しました。再生を停止できませんでした。",
          ephemeral: true
        });
      }
    }
  }
};
