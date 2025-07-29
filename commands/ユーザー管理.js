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
  InteractionType
} = require('discord.js');

const TIMEOUT_DURATIONS = {
  '5m': 5 * 60 * 1000,
  '10m': 10 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ユーザー管理')
    .setDescription('ユーザーを管理します（ban, unban, kick, timeout, untimeout）')
    .addUserOption(opt =>
      opt.setName('ユーザー').setDescription('対象のユーザー').setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('ユーザーid').setDescription('IDで指定（参加していなくても可）')
    )
    .addStringOption(opt =>
      opt.setName('アクション')
        .setDescription('実行する操作')
        .setRequired(true)
        .addChoices(
          { name: 'ban', value: 'ban' },
          { name: 'unban', value: 'unban' },
          { name: 'kick', value: 'kick' },
          { name: 'timeout', value: 'timeout' },
          { name: 'untimeout', value: 'untimeout' }
        )
    )
    .addStringOption(opt =>
      opt.setName('理由').setDescription('操作の理由（任意）')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const member = interaction.options.getMember('ユーザー');
    const userId = interaction.options.getString('ユーザーid');
    const action = interaction.options.getString('アクション');
    const reason = interaction.options.getString('理由') || '理由未記入';

    const targetId = member?.id || userId;
    if (!targetId) {
      return await interaction.reply({ content: 'ユーザーを指定してください。', ephemeral: true });
    }

    const executorId = interaction.user.id;

    // タイムアウト選択メニュー（only if timeout）
    if (action === 'timeout') {
      const select = new StringSelectMenuBuilder()
        .setCustomId(`timeout_select_${targetId}_${executorId}`)
        .setPlaceholder('⏱️ タイムアウト時間を選択')
        .addOptions([
          { label: '5分', value: '5m' },
          { label: '10分', value: '10m' },
          { label: '1時間', value: '1h' },
          { label: '1日', value: '1d' },
          { label: '1週間', value: '1w' }
        ]);
      return await interaction.reply({
        content: `タイムアウトする時間を選んでください：\`${targetId}\``,
        components: [new ActionRowBuilder().addComponents(select)],
        ephemeral: true
      });
    }

    // 通常アクションは確認
    const actionText = {
      ban: '🔨 BAN確認',
      unban: '🔓 UNBAN確認',
      kick: '👢 キック確認',
      untimeout: '✅ タイムアウト解除確認'
    }[action];

    const color = {
      ban: 0xff0000,
      kick: 0xf1c40f,
      timeout: 0xffcc00,
      unban: 0x00ccff,
      untimeout: 0x00ccff
    }[action];

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(actionText)
      .setDescription(`ユーザー: <@${targetId}> を **${action}** しますか？\n理由: \`${reason}\``);

    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_${action}_${targetId}_${executorId}`)
        .setLabel('確認')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`cancel_${executorId}`)
        .setLabel('キャンセル')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [confirmRow], ephemeral: true });
  }
};
