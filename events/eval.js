const {
  Events,
  EmbedBuilder
} = require('discord.js');

const ALLOWED_USER = '1365228588261052499';

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'eval_modal') return;

    if (interaction.user.id !== ALLOWED_USER) {
      return interaction.reply({
        content: '❌ あなたにはこのモーダルの使用権限がありません。',
        ephemeral: true
      });
    }

    const input = interaction.fields.getTextInputValue('eval_code');

    try {
      const result = await eval(`(async () => { ${input} })()`);

      const output =
        typeof result === 'string'
          ? result
          : JSON.stringify(result, null, 2);

      const embed = new EmbedBuilder()
        .setTitle('✅ 実行結果')
        .addFields(
          { name: '入力コード', value: '```js\n' + input + '\n```' },
          { name: '結果', value: '```js\n' + output + '\n```' }
        )
        .setColor('Green')
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (err) {
      const embed = new EmbedBuilder()
        .setTitle('❌ エラーが発生しました')
        .addFields(
          { name: '入力コード', value: '```js\n' + input + '\n```' },
          { name: 'エラー', value: '```ts\n' + err.message + '\n```' }
        )
        .setColor('Red')
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
