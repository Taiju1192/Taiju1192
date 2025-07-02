const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const NOTIFY_USERS = ["1365228588261052499", "1191337970981146705"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("request")
    .setDescription("曲をリクエストします")
    .addStringOption(opt =>
      opt.setName("title").setDescription("曲名・詳細・リンクなど").setRequired(true)
    ),

  async execute(interaction) {
    const title = interaction.options.getString("title");

    // 👇 まず応答を遅延する (これが重要)
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("🎵 新しい曲リクエスト")
      .setDescription(`リクエスト者: <@${interaction.user.id}>\n\n\`\`\`\n${title}\n\`\`\``)
      .setColor("Blue")
      .setTimestamp();

    for (const userId of NOTIFY_USERS) {
      try {
        const user = await interaction.client.users.fetch(userId);
        await user.send({ embeds: [embed] });
      } catch (err) {
        console.error(`❌ DM送信失敗 (${userId})`, err);
      }
    }

    // 👇 最後に返信を完了する
    await interaction.editReply({ content: "✅ リクエストを送信しました。ご協力ありがとうございます！" });
  }
};
