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

    // 応答がまだ送信されていない場合、遅延応答を送る
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }

    try {
      // メッセージ削除（全てのメッセージを取得）
      const messages = await interaction.channel.messages.fetch({ limit: count });

      // BOTのメッセージを除外
      const filteredMessages = messages.filter(msg => !msg.author.bot);

      // もしBOTのメッセージが全てであった場合、削除できるメッセージがない
      if (filteredMessages.size === 0) {
        return await interaction.followUp({
          content: "⚠ 削除するメッセージがありません（BOTのメッセージは削除しません）。",
          ephemeral: true
        });
      }

      // 指定された数だけ削除（もしBOTのメッセージがある場合）
      const deleted = await interaction.channel.bulkDelete(filteredMessages, true);

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
