const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

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

    if (count < 1 || count > 100) {
      return await interaction.reply({
        content: "❌ 削除できるメッセージ数は 1〜100 の間です。",
        flags: 64
      });
    }

    const deleted = await interaction.channel.bulkDelete(count, true).catch(err => {
      console.error("削除失敗:", err);
      return null;
    });

    if (!deleted) {
      return await interaction.reply({
        content: "⚠ メッセージの削除に失敗しました（14日以上前のメッセージは削除不可です）。",
        flags: 64
      });
    }

    await interaction.reply({
      content: `✅ ${deleted.size} 件のメッセージを削除しました。`,
      flags: 64
    });
  }
};
