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
      // メッセージ削除（指定された数のメッセージを取得）
      const messages = await interaction.channel.messages.fetch({ limit: count });

      // メッセージを一括削除
      const deletedMessages = await interaction.channel.bulkDelete(messages, true);

      // 削除したメッセージ数をログ用Embedに追加
      const successEmbed = new EmbedBuilder()
        .setTitle("✅ メッセージ削除完了")
        .setDescription(`${deletedMessages.size} 件のメッセージを削除しました。`)
        .setColor(Colors.Green)
        .setTimestamp()
        .setFooter({
          text: `削除者: ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        });

      // 成功メッセージを削除後に送信
      await interaction.followUp({
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
