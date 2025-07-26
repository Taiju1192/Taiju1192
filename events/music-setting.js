const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");
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

    if (selected === "speed") {
      const speedMenu = new StringSelectMenuBuilder()
        .setCustomId("set_speed_select")
        .setPlaceholder("スピードを選んでください")
        .addOptions([
          { label: "0.5倍", value: "0.5", emoji: "⏩" },
          { label: "1倍", value: "1", emoji: "⏩" },
          { label: "1.25倍", value: "1.25", emoji: "⏩" },
          { label: "1.5倍", value: "1.5", emoji: "⏩" },
          { label: "2倍", value: "2", emoji: "⏩" },
        ]);

      const row = new ActionRowBuilder().addComponents(speedMenu);
      await interaction.reply({
        content: "再生速度を選んでください:",
        components: [row],
        ephemeral: true,
      });
      return true;
    }

    if (selected === "repeat") {
      if (!playerData) {
        await interaction.reply({ content: "⚠ プレイヤーが見つかりません。", ephemeral: true });
      } else {
        playerData.repeat = !playerData.repeat;
        await interaction.reply({
          content: playerData.repeat ? "🔁 リピートを有効にしました。" : "🔁 リピートを無効にしました。",
          ephemeral: true,
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

    if (isNaN(volume) || volume < 0.1 || volume > 2) {
      await interaction.reply({
        content: "❌ 無効な音量。0.1〜2.0 の数値で入力してください。",
        ephemeral: true,
      });
      return true;
    }

    const playerData = activePlayers.get(interaction.guildId);
    if (!playerData || !playerData.player?.state?.resource) {
      await interaction.reply({
        content: "⚠ 現在再生中の曲がありません。",
        ephemeral: true,
      });
      return true;
    }

    // 音量設定処理
    const connection = playerData.player.state.resource;
    const volumeControl = connection.volume;
    if (volumeControl) {
      volumeControl.setVolume(volume); // 音量設定
    }

    playerData.volume = volume;

    await interaction.reply({
      content: `🔊 音量を \`${volume}\` に設定しました。`,
      ephemeral: true,
    });
    return true;
  }

  // スピード選択
  if (interaction.isStringSelectMenu() && interaction.customId === "set_speed_select") {
    const selectedSpeed = parseFloat(interaction.values[0]);
    if (isNaN(selectedSpeed) || selectedSpeed < 0.5 || selectedSpeed > 2) {
      await interaction.reply({
        content: "❌ 無効なスピード。0.5倍〜2倍の範囲で設定してください。",
        ephemeral: true,
      });
      return true;
    }

    const playerData = activePlayers.get(interaction.guildId);
    if (!playerData || !playerData.player?.state?.resource) {
      await interaction.reply({
        content: "⚠ 現在再生中の曲がありません。",
        ephemeral: true,
      });
      return true;
    }

    // スピード設定処理（音楽ライブラリやプレイヤーによって異なる）
    const connection = playerData.player.state.resource;
    const audioPlayer = connection.player;
    audioPlayer.setPlaybackRate(selectedSpeed);

    await interaction.reply({
      content: `⏩ 再生スピードを \`${selectedSpeed}倍\` に設定しました。`,
      ephemeral: true,
    });
    return true;
  }

  return false;
};
