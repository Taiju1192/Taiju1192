const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");
const { evaluate } = require("mathjs");
const activePlayers = require("../activePlayers");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      // ✅ 電卓セレクトメニュー
      if (interaction.isStringSelectMenu() && interaction.customId === "calc_menu") {
        const modal = new ModalBuilder()
          .setCustomId("calculator_modal")
          .setTitle("📊 計算式を入力");

        const input = new TextInputBuilder()
          .setCustomId("expression_input")
          .setLabel("計算式を入力（例: 1/2 + 3/4）")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        try {
          // モーダル表示は未応答状態でのみ
          if (!interaction.replied && !interaction.deferred) {
            await interaction.showModal(modal);
          }
        } catch (err) {
          console.error("❌ モーダル表示に失敗:", err);
        }
        return;
      }

      // ✅ 電卓モーダル送信
      if (interaction.isModalSubmit() && interaction.customId === "calculator_modal") {
        const expression = interaction.fields.getTextInputValue("expression_input");
        try {
          const result = evaluate(expression);
          await interaction.reply({
            content: `✅ \`${expression}\` の結果は \`${result}\` です。`,
            ephemeral: true
          });
        } catch (err) {
          await interaction.reply({
            content: "❌ 数式が無効です。例: `1/2 + 3/4`",
            ephemeral: true
          });
        }
        return;
      }

      // ✅ 音楽設定メニュー選択
      if (interaction.isStringSelectMenu() && interaction.customId === "music_settings") {
        const selected = interaction.values[0];
        const playerData = activePlayers.get(interaction.guildId);

        if (selected === "volume") {
          const modal = new ModalBuilder()
            .setCustomId("set_volume_modal")
            .setTitle("🔊 音量調整");

          const input = new TextInputBuilder()
            .setCustomId("volume_input")
            .setLabel("0.1（最小）〜 2.0（最大）")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("例: 0.5")
            .setRequired(true);

          const row = new ActionRowBuilder().addComponents(input);
          modal.addComponents(row);

          try {
            if (!interaction.replied && !interaction.deferred) {
              await interaction.showModal(modal);
            }
          } catch (err) {
            console.error("❌ モーダル表示に失敗:", err);
          }
          return;
        }

        if (selected === "repeat") {
          if (!playerData) {
            return interaction.reply({ content: "⚠ プレイヤーが見つかりません。", ephemeral: true });
          }

          playerData.repeat = !playerData.repeat;
          return interaction.reply({
            content: playerData.repeat ? "🔁 リピートを有効にしました。" : "🔁 リピートを無効にしました。",
            ephemeral: true
          });
        }

        if (selected === "shuffle") {
          if (!playerData || !Array.isArray(playerData.queue) || playerData.queue.length === 0) {
            return interaction.reply({ content: "⚠ シャッフル対象がありません。", ephemeral: true });
          }

          playerData.queue.sort(() => Math.random() - 0.5);
          return interaction.reply({ content: "🔀 再生キューをシャッフルしました。", ephemeral: true });
        }

        return interaction.reply({ content: "⚠ 不明な選択肢です。", ephemeral: true });
      }

      // ✅ 音量モーダル送信
      if (interaction.isModalSubmit() && interaction.customId === "set_volume_modal") {
        const input = interaction.fields.getTextInputValue("volume_input");
        const volume = parseFloat(input);

        if (isNaN(volume) || volume <= 0 || volume > 2) {
          return interaction.reply({
            content: "❌ 無効な音量。0.1〜2.0 の数値で入力してください。",
            ephemeral: true
          });
        }

        const playerData = activePlayers.get(interaction.guildId);
        if (!playerData || !playerData.player || !playerData.player.state.resource) {
          return interaction.reply({
            content: "⚠ 現在再生中の曲がありません。",
            ephemeral: true
          });
        }

        playerData.player.state.resource.volume?.setVolume(volume);
        playerData.volume = volume;

        return interaction.reply({
          content: `🔊 音量を \`${volume}\` に設定しました。`,
          ephemeral: true
        });
      }

      // ✅ スラッシュコマンド実行
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error("❌ コマンド実行エラー:", error);
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({
                content: "⚠ コマンド実行中にエラーが発生しました。",
                ephemeral: true
              });
            } else {
              await interaction.reply({
                content: "⚠ コマンド実行中にエラーが発生しました。",
                ephemeral: true
              });
            }
          } catch (e) {
            console.error("❌ 二重応答エラー:", e);
          }
        }
      }

    } catch (err) {
      console.error("❌ interactionCreate.js 内部エラー:", err);
    }
  }
};

