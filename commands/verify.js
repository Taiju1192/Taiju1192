const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('✅ 認証パネルを設置します')
    .addRoleOption(option =>
      option.setName('ロール')
        .setDescription('認証後に付与するロール')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('タイトル')
        .setDescription('パネルのタイトル'))
    .addStringOption(option =>
      option.setName('概要')
        .setDescription('パネルの説明文'))
    .addStringOption(option =>
      option.setName('ボタンラベル')
        .setDescription('ボタンに表示するテキスト'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('ロール');
    const title = interaction.options.getString('タイトル') || '✅ 認証パネル';
    const description = interaction.options.getString('概要') || '以下のボタンを押して認証を完了してください。';
    const buttonLabel = interaction.options.getString('ボタンラベル') || 'Verify✅';

    // Botのロール順位チェック
    const botMember = await interaction.guild.members.fetchMe();
    if (botMember.roles.highest.comparePositionTo(role) <= 0) {
      return interaction.reply({
        content: '⚠️ Botのロールが指定されたロールより下のため、付与できません。',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(`${description}\n\n\`\`\`\n付与ロール: ${role.name}\n\`\`\``)
      .setColor(0x2ecc71);

    const button = new ButtonBuilder()
      .setCustomId(`verify-role-${role.id}`)
      .setLabel(buttonLabel)
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
