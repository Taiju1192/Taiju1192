const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ユーザー管理')
    .setDescription('指定ユーザーの管理操作を行います')
    .addUserOption(opt =>
      opt.setName('対象ユーザー')
        .setDescription('操作対象のユーザー')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('ユーザーid')
        .setDescription('ID指定で操作対象を設定する')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const executor = interaction.member;
    const guild = interaction.guild;

    const targetUser = interaction.options.getUser('対象ユーザー');
    const userId = interaction.options.getString('ユーザーid');

    let target;
    if (targetUser) {
      target = targetUser;
    } else if (userId && /^\d{17,19}$/.test(userId)) {
      try {
        target = await interaction.client.users.fetch(userId);
      } catch {
        return interaction.reply({ content: '❌ ユーザーが見つかりませんでした。', ephemeral: true });
      }
    } else {
      return interaction.reply({ content: '❌ 対象ユーザーまたはIDを指定してください。', ephemeral: true });
    }

    const actions = new StringSelectMenuBuilder()
      .setCustomId('user_manage_action')
      .setPlaceholder('操作を選択...')
      .addOptions([
        { label: 'Ban', value: 'ban' },
        { label: 'Unban', value: 'unban' },
        { label: 'Kick', value: 'kick' },
        { label: 'Timeout', value: 'timeout' },
        { label: 'Untimeout', value: 'untimeout' }
      ]);

    const row = new ActionRowBuilder().addComponents(actions);

    await interaction.reply({
      content: `🔧 対象: ${target.tag}（\`${target.id}\`）に対する操作を選んでください。`,
      components: [row],
      ephemeral: true
    });

    const msg = await interaction.fetchReply();
    const collector = msg.createMessageComponentCollector({
      componentType: 3,
      time: 60_000
    });

    collector.on('collect', async sel => {
      if (sel.user.id !== interaction.user.id) {
        return sel.reply({
          embeds: [new EmbedBuilder()
            .setColor('Yellow')
            .setDescription(`⚠️ この操作は <@${interaction.user.id}> のみが実行できます。`)],
          ephemeral: true
        });
      }

      const action = sel.values[0];

      // 確認Embed + ボタン
      const confirmEmbed = new EmbedBuilder()
        .setTitle('確認')
        .setColor(action === 'ban' ? 'Red' : action === 'timeout' ? 'Orange' : 'Yellow')
        .setDescription(`🛠️ ${target.tag}（\`${target.id}\`）に対して **${action.toUpperCase()}** を実行しますか？`);

      if (action === 'timeout') {
        const timeoutOptions = new StringSelectMenuBuilder()
          .setCustomId('select_timeout')
          .setPlaceholder('タイムアウト時間を選択')
          .addOptions([
            { label: '1時間', value: '1h' },
            { label: '6時間', value: '6h' },
            { label: '12時間', value: '12h' },
            { label: '1日', value: '1d' },
            { label: '3日', value: '3d' },
            { label: '7日', value: '7d' }
          ]);
        return sel.update({ content: '', embeds: [confirmEmbed.setDescription('⏱️ タイムアウト時間を選択してください。')], components: [new ActionRowBuilder().addComponents(timeoutOptions)] });
      }

      const confirmButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`confirm_${action}`)
            .setLabel('実行')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('キャンセル')
            .setStyle(ButtonStyle.Secondary)
        );

      sel.update({ content: '', embeds: [confirmEmbed], components: [confirmButtons] });
    });

    // timeout duration select
    const timeoutCollector = msg.createMessageComponentCollector({
      componentType: 3,
      time: 60_000
    });

    timeoutCollector.on('collect', async sel => {
      if (!sel.customId.startsWith('select_timeout')) return;
      if (sel.user.id !== interaction.user.id) {
        return sel.reply({ content: 'この操作はあなたにはできません。', ephemeral: true });
      }

      const value = sel.values[0];
      const durations = {
        '1h': 60 * 60_000,
        '6h': 6 * 60 * 60_000,
        '12h': 12 * 60 * 60_000,
        '1d': 24 * 60 * 60_000,
        '3d': 3 * 24 * 60 * 60_000,
        '7d': 7 * 24 * 60 * 60_000
      };
      const ms = durations[value];

      const confirmEmbed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle('⏱️ タイムアウト確認')
        .setDescription(`⏳ ${target.tag} を **${value}** タイムアウトしますか？`);

      const confirmButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`confirm_timeout_${ms}`)
            .setLabel('実行')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('キャンセル')
            .setStyle(ButtonStyle.Secondary)
        );

      sel.update({ embeds: [confirmEmbed], components: [confirmButtons] });
    });

    // confirm / cancel
    const buttonCollector = msg.createMessageComponentCollector({
      componentType: 2,
      time: 60_000
    });

    buttonCollector.on('collect', async btn => {
      if (btn.user.id !== interaction.user.id) {
        return btn.reply({ content: 'あなたはこの操作を実行できません。', ephemeral: true });
      }

      if (btn.customId === 'cancel') {
        return btn.update({ content: '🚫 操作はキャンセルされました。', embeds: [], components: [] });
      }

      let reason = '理由未記入';

      // 簡易モーダルで理由入力
      const modal = new ModalBuilder()
        .setCustomId('input_reason')
        .setTitle('理由の入力')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('reason_text')
              .setLabel('理由を入力してください')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false)
          )
        );

      await btn.showModal(modal);

      const modalSubmit = await btn.awaitModalSubmit({ time: 30_000 }).catch(() => null);
      if (modalSubmit) {
        reason = modalSubmit.fields.getTextInputValue('reason_text') || '理由未記入';
        await modalSubmit.deferReply({ ephemeral: true });
      }

      // 実行処理
      const member = await guild.members.fetch(target.id).catch(() => null);
      try {
        if (btn.customId === 'confirm_ban') {
          await guild.members.ban(target.id, { reason });
          await btn.update({ content: `✅ ${target.tag} をBanしました。\n\`\`\`\n理由: ${reason}\n\`\`\``, embeds: [], components: [] });
        } else if (btn.customId === 'confirm_unban') {
          await guild.bans.remove(target.id, reason);
          await btn.update({ content: `✅ ${target.tag} をUnbanしました。\n\`\`\`\n理由: ${reason}\n\`\`\``, embeds: [], components: [] });
        } else if (btn.customId === 'confirm_kick') {
          if (!member) throw 'ユーザーがサーバーにいません';
          await member.kick(reason);
          await btn.update({ content: `✅ ${target.tag} をKickしました。\n\`\`\`\n理由: ${reason}\n\`\`\``, embeds: [], components: [] });
        } else if (btn.customId.startsWith('confirm_timeout_')) {
          const ms = parseInt(btn.customId.split('_')[2]);
          if (!member) throw 'ユーザーがサーバーにいません';
          await member.timeout(ms, reason);
          await btn.update({ content: `✅ ${target.tag} をタイムアウトしました（${ms / 60_000}分）。\n\`\`\`\n理由: ${reason}\n\`\`\``, embeds: [], components: [] });
        } else if (btn.customId === 'confirm_untimeout') {
          if (!member) throw 'ユーザーがサーバーにいません';
          await member.timeout(null, reason);
          await btn.update({ content: `✅ ${target.tag} のタイムアウトを解除しました。\n\`\`\`\n理由: ${reason}\n\`\`\``, embeds: [], components: [] });
        }
      } catch (err) {
        await btn.update({ content: `❌ 実行中にエラーが発生しました。\n\`\`\`\n${err}\n\`\`\``, embeds: [], components: [] });
      }
    });
  }
};
