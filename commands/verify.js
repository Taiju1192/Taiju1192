const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('認証パネルを送信します')
    // ✅ 必須オプションは最初に書く
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('付与するロール')
        .setRequired(true)
    )
    // 以下は任意なので後ろに
    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('タイトル')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('説明文')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('button')
        .setDescription('ボタンのラベル')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option
        .setName('image')
        .setDescription('埋め込み画像')
        .setRequired(false)
    )
    .addChannelOption(option =>
      option
        .setName('logchannel')
        .setDescription('認証成功のログを送信するチャンネル')
        .addChannelTypes(0)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ このコマンドは管理者のみ使用できます。',
        ephemeral: true
      });
    }

    const role = interaction.options.getRole('role');
    const title = interaction.options.getString('title') || '✅ 認証パネル';
    const description = interaction.options.getString('description') || `以下のボタンを押すことで ${role} が付与されます。`;
    const buttonLabel = interaction.options.getString('button') || '認証';
    const image = interaction.options.getAttachment('image');
    const logChannel = interaction.options.getChannel('logchannel');

    const colors = [0xff5733, 0x33ff57, 0x3357ff, 0xff33a6, 0x33fff3, 0xffa833, 0xa833ff];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    if (image && image.contentType?.startsWith('image')) {
      embed.setImage(image.url);
    }

    const button = new ButtonBuilder()
      .setCustomId(`verify-${role.id}-${logChannel?.id}`)
      .setLabel(buttonLabel)
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });

    if (logChannel?.isTextBased()) {
      const logEmbed = new EmbedBuilder()
        .setTitle('🎫 認証パネル作成')
        .setDescription(`👤 <@${interaction.user.id}> が認証パネルを作成しました。`)
        .setColor(0x00bfff)
        .setTimestamp();

      await logChannel.send({ embeds: [logEmbed] });
    }
  }
};
