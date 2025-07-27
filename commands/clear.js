const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("指定した数のメッセージを一括削除します（最大100件）")
    .addIntegerOption(option =>
      option
        .setName("count")
        .setDescription("削除するメッセージ数（1〜100）")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // 権限制限

  async execute(interaction) {
    const count = interaction.options.getInteger("count");

    // 数のバリデーション
    if (count < 1 || count > 100) {
      return await interaction.reply({
        content: "❌ 削除できるメッセージ数は 1〜100 の間です。",
        ephemeral: true
      });
    }

    try {
      // 応答を遅延させ、後でメッセージを削除する
      await interaction.deferReply();

      const deleted = await interaction.channel.bulkDelete(count, true).catch(err => {
        console.error("削除失敗:", err);
        return null;
      });

      if (!deleted || deleted.size === 0) {
        return await interaction.followUp({
          content: "⚠ メッセージの削除に失敗しました（14日以上前のメッセージは削除不可です）。",
          ephemeral: true
        });
      }

      // 削除成功のログ用Embedを作成
      const successEmbed = new EmbedBuilder()
        .setTitle("✅ メッセージ削除完了")
        .setDescription(`${deleted.size} 件のメッセージを削除しました。`)
        .setColor(Colors.Green)
        .setTimestamp()
        .setFooter({
          text: `削除者: ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        });

      // 成功のログを送信
      return await interaction.followUp({
        embeds: [successEmbed],
        ephemeral: true
      });

    } catch (err) {
      console.error("削除失敗:", err);
      return await interaction.followUp({
        content: "❌ メッセージの削除中にエラーが発生しました。",
        ephemeral: true
      });
    }
  }
};
