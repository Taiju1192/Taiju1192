const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");
const activePlayers = require("../activePlayers");

module.exports = async function musicSetting(interaction) {
  // メニュー選択
  if (interaction.isStringSelectMenu() && interaction.customId === "music_settings") {
    const selected = interaction.values[0];
    const playerData = activePlayers.get(interaction.guildId);

    if (selected === "volume") {
      const modal = new ModalBuilder()
        .setCustomId("set_volume_modal")
        .setTitle("🔊 音量調整");

      const input = new TextInputBuilder()
        .setCustomId("volume_input")
        .setLabel("0.1〜2.0")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("例: 0.5")
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.showModal(modal);
      }
      return true;
    }

    if (selected === "repeat") {
      if (!playerData) {
        await interaction.reply({ content: "⚠ プレイヤーが見つかりません。", ephemeral: true });
      } else {
        playerData.repeat = !playerData.repeat;
        await interaction.reply({
          content: playerData.repeat ? "🔁 リピートを有効にしました。" : "🔁 リピートを無効にしました。",
          ephemeral: true
        });
      }
      return true;
    }

    if (selected === "shuffle") {
      if (!playerData || !Array.isArray(playerData.queue) || playerData.queue.length === 0) {
        await interaction.reply({ content: "⚠ シャッフル対象がありません。", ephemeral: true });
      } else {
        playerData.queue.sort(() => Math.random() - 0.5);
        await interaction.reply({ content: "🔀 再生キューをシャッフルしました。", ephemeral: true });
      }
      return true;
    }

    await interaction.reply({ content: "⚠ 不明な選択肢です。", ephemeral: true });
    return true;
  }

  // 音量モーダル送信
  if (interaction.isModalSubmit() && interaction.customId === "set_volume_modal") {
    const input = interaction.fields.getTextInputValue("volume_input");
    const volume = parseFloat(input);

    if (isNaN(volume) || volume <= 0 || volume > 2) {
      await interaction.reply({
        content: "❌ 無効な音量。0.1〜2.0 の数値で入力してください。",
        ephemeral: true
      });
      return true;
    }

    const playerData = activePlayers.get(interaction.guildId);
    if (!playerData || !playerData.player?.state?.resource) {
      await interaction.reply({
        content: "⚠ 現在再生中の曲がありません。",
        ephemeral: true
      });
      return true;
    }

    playerData.player.state.resource.volume?.setVolume(volume);
    playerData.volume = volume;

    await interaction.reply({
      content: `🔊 音量を \`${volume}\` に設定しました。`,
      ephemeral: true
    });
    return true;
  }

  return false;
};
