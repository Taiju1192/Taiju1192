const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    const client = interaction.client; // 👈 ここが重要！

    // ✅ スラッシュコマンド処理
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          content: '⚠️ コマンドが見つかりません。',
          ephemeral: true
        });
      }

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error('❌ コマンド実行エラー:', err);
        return interaction.reply({
          content: '⚠️ 実行中にエラーが発生しました。',
          ephemeral: true
        });
      }
    }


    // ✅ ボタンインタラクション（verify-role-xxx）
    else if (interaction.isButton() && interaction.customId.startsWith('verify-role-')) {
      const roleId = interaction.customId.split('-')[2];
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {
        return interaction.reply({
          content: '⚠️ ロールが見つかりません。',
          ephemeral: true
        });
      }

      if (interaction.member.roles.cache.has(role.id)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xffcc00)
              .setTitle('⚠️ 認証済み')
              .setDescription(`\`\`\`\nあなたは既に ${role.name} を持っています。\n\`\`\``)
          ],
          ephemeral: true
        });
      }

      try {
        await interaction.member.roles.add(role);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x00ff00)
              .setTitle('✅ 認証完了')
              .setDescription(`\`\`\`\nロール ${role.name} を付与しました。\n\`\`\``)
          ],
          ephemeral: true
        });
      } catch (error) {
        console.error(error);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle('❌ ロール付与失敗')
              .setDescription('ロールを付与できませんでした。管理者に連絡してください。')
          ],
          ephemeral: true
        });
      }
    }
  }
};
