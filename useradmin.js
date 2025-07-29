client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    const [action, actType, targetId, executorId] = interaction.customId.split('_');

    if (interaction.user.id !== executorId) {
      return await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xf1c40f)
          .setTitle('⚠️ 操作できません')
          .setDescription('このボタンは他の人が使用できません。')],
        ephemeral: true
      });
    }

    if (interaction.replied || interaction.deferred) {
      return; // Prevent "Unknown interaction" error
    }
    await interaction.deferUpdate();

    const guild = interaction.guild;

    try {
      const member = await guild.members.fetch(targetId).catch(() => null);
      const reason = '理由未記入';

      if (action === 'confirm') {
        switch (actType) {
          case 'ban':
            await guild.members.ban(targetId, { reason });
            break;
          case 'unban':
            await guild.bans.remove(targetId, reason);
            break;
          case 'kick':
            await member?.kick(reason);
            break;
          case 'untimeout':
            await member?.timeout(null, reason);
            break;
        }

        const doneEmbed = new EmbedBuilder()
          .setColor(0x00cc99)
          .setTitle('✅ 完了')
          .setDescription(`操作 \`${actType}\` が正常に完了しました。\n対象: <@${targetId}>`);

        return await interaction.editReply({ embeds: [doneEmbed], components: [] });
      }

      if (action === 'cancel') {
        return await interaction.editReply({
          embeds: [new EmbedBuilder().setColor(0x95a5a6).setTitle('❌ キャンセルされました')],
          components: []
        });
      }
    } catch (err) {
      console.error(err);
      return await interaction.editReply({
        content: `エラー: ${err.message}`,
        components: []
      });
    }
  }

  if (interaction.isStringSelectMenu()) {
    const [prefix, targetId, executorId] = interaction.customId.split('_');
    if (interaction.user.id !== executorId) return;

    const value = interaction.values[0];
    const ms = TIMEOUT_DURATIONS[value];

    const embed = new EmbedBuilder()
      .setColor(0xffcc00)
      .setTitle('⏱️ タイムアウト確認')
      .setDescription(`⏳ <@${targetId}> を **${value}** タイムアウトしますか？`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_timeout_${targetId}_${executorId}_${ms}`)
        .setLabel('確認')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`cancel_${executorId}`)
        .setLabel('キャンセル')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({ embeds: [embed], components: [row] });
  }

  if (interaction.isButton() && interaction.customId.startsWith('confirm_timeout')) {
    const [, , targetId, executorId, ms] = interaction.customId.split('_');

    if (interaction.user.id !== executorId) return;
    if (interaction.replied || interaction.deferred) return;
    await interaction.deferUpdate();

    const member = await interaction.guild.members.fetch(targetId).catch(() => null);
    if (!member) return;

    await member.timeout(Number(ms), '理由未記入');

    const doneEmbed = new EmbedBuilder()
      .setColor(0x00cc99)
      .setTitle('✅ タイムアウト完了')
      .setDescription(`<@${targetId}> を正常にタイムアウトしました。`);

    await interaction.editReply({ embeds: [doneEmbed], components: [] });
  }
});
