const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");
const { evaluate } = require("mathjs");

module.exports = async function calculator(interaction) {
  // 電卓セレクトメニュー
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

    if (!interaction.replied && !interaction.deferred) {
      await interaction.showModal(modal);
    }
    return true;
  }

  // モーダル送信
  if (interaction.isModalSubmit() && interaction.customId === "calculator_modal") {
    const expression = interaction.fields.getTextInputValue("expression_input");
    try {
      const result = evaluate(expression);
      await interaction.reply({
        content: `✅ \`${expression}\` の結果は \`${result}\` です。`,
        ephemeral: true
      });
    } catch {
      await interaction.reply({
        content: "❌ 数式が無効です。例: `1/2 + 3/4`",
        ephemeral: true
      });
    }
    return true;
  }

  return false
