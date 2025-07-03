const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");
const { evaluate } = require("mathjs");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // セレクトメニュー選択 → モーダル表示
    if (interaction.isStringSelectMenu() && interaction.customId === "calc_menu") {
      const modal = new ModalBuilder()
        .setCustomId("calculator_modal")
        .setTitle("📊 計算式を入力");

      const input = new TextInputBuilder()
        .setCustomId("expression_input")
        .setLabel("例: 2 + 3 * (4 - 1)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      await interaction.showModal(modal);
      return;
    }

    // モーダル送信時 → 数式を評価
    if (interaction.isModalSubmit() && interaction.customId === "calculator_modal") {
      const expression = interaction.fields.getTextInputValue("expression_input");
      try {
        const result = evaluate(expression);
        await interaction.reply({
          content: `✅ \`${expression}\` の結果は \`${result}\` です。`,
          ephemeral: true
        });
      } catch (error) {
        await interaction.reply({
          content: "❌ 数式の形式が正しくありません。もう一度お試しください。",
          ephemeral: true
        });
      }
      return;
    }

    // 他のセレクトメニュー（music-setting など）
    if (interaction.isStringSelectMenu() && interaction.customId === "music_settings") {
      const map = {
        volume: "🔊 音量調整を選択しました。",
        repeat: "🔁 リピート再生の切り替えを行います。",
        speed: "⏩ スピード調整のオプションが選ばれました。",
        shuffle: "🔀 シャッフル再生の設定を変更します。"
      };

      const response = map[interaction.values[0]] || "⚠ 不明なオプションです。";
      await interaction.reply({ content: response, ephemeral: true });
      return;
    }

    // スラッシュコマンド処理
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error("❌ コマンド実行エラー:", error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: "⚠ エラーが発生しました。", ephemeral: true });
        } else {
          await interaction.reply({ content: "⚠ エラーが発生しました。", ephemeral: true });
        }
      }
    }
  }
};
