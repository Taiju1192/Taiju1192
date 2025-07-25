// モーダル submit（eval_modal 用）
if (interaction.isModalSubmit() && interaction.customId === 'eval_modal') {
  if (interaction.user.id !== '1365228588261052499') {
    return interaction.reply({ content: '❌ 権限がありません。', ephemeral: true });
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
      .setColor('Green');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (err) {
    const embed = new EmbedBuilder()
      .setTitle('❌ エラー発生')
      .addFields(
        { name: '入力コード', value: '```js\n' + input + '\n```' },
        { name: 'エラー', value: '```ts\n' + err.message + '\n```' }
      )
      .setColor('Red');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
