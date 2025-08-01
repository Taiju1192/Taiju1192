const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType
} = require("discord.js");

const helpPages = [
  new EmbedBuilder()
    .setTitle("🎵 音楽Botコマンド一覧 (1/2)")
    .setDescription(`
\`\`\`
/start : 音楽を再生します。
/stop : 音楽を停止します。
/skip : 曲をスキップします。
/request : 管理者にリクエストを送信。
\`\`\`
`)
    .setColor("Blue"),

  new EmbedBuilder()
    .setTitle("🎵 音楽Botコマンド一覧 (2/2)")
    .setDescription(`
\`\`\`
/help または m!help : このヘルプを表示します。
全てのコマンドは正しい日本語で明確に表記されています。
\`\`\`
`)
    .setColor("Green")
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("音楽コマンドの使い方を表示します"),

  async execute(interaction) {
    let page = 0;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("prev").setLabel("⬅ 前へ").setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId("next").setLabel("次へ ➡").setStyle(ButtonStyle.Secondary)
    );

    const msg = await interaction.reply({ embeds: [helpPages[page]], components: [row], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

    collector.on("collect", async i => {
      if (i.customId === "next") page = 1;
      else if (i.customId === "prev") page = 0;

      row.components[0].setDisabled(page === 0);
      row.components[1].setDisabled(page === helpPages.length - 1);

      await i.update({ embeds: [helpPages[page]], components: [row] });
    });
  }
};
