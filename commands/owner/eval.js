const {
  SlashCommandBuilder,
  EmbedBuilder,
  codeBlock
} = require('discord.js');

const ALLOWED_USER = '1365228588261052499';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('JavaScriptコードを評価します（開発者専用）')
    .addStringOption(opt =>
      opt.setName('code')
        .setDescription('実行するコード（return を含めると結果が出力されます）')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== ALLOWED_USER) {
      return interaction.reply({
        content: '❌ このコマンドは開発者専用です。',
        ephemeral: true
      });
    }

    const input = interaction.options.getString('code');

    try {
      const result = await eval(`(async () => { ${input} })()`);

      const embed = new EmbedBuilder()
        .setTitle('✅ 実行結果')
        .addFields(
          { name: '入力コード', value: codeBlock('js', input) },
          {
            name: '結果',
            value: codeBlock('js', typeof result === 'string'
              ? result
              : JSON.stringify(result, null, 2))
          }
        )
        .setColor('Green');

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (err) {
      const embed = new EmbedBuilder()
        .setTitle('❌ 実行中にエラーが発生')
        .addFields(
          { name: '入力コード', value: codeBlock('js', input) },
          { name: 'エラー', value: codeBlock('ts', err.message) }
        )
        .setColor('Red');

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
