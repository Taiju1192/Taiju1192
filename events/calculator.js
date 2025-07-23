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

    } catch (err) {
      console.error("❌ calculator.js 内部エラー:", err);
    }
  }
};
