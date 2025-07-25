const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('他ユーザーにDMを送信（管理者専用）')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('送信相手（ユーザー選択）')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('user_id')
        .setDescription('送信相手のユーザーID（未選択時に使う）')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('送信内容')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ このコマンドはサーバー内の管理者専用です。',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');
    const userId = interaction.options.getString('user_id');
    const message = interaction.options.getString('message');

    let user;

    try {
      if (targetUser) {
        user = targetUser;
      } else if (userId) {
        user = await interaction.client.users.fetch(userId);
      } else {
        return interaction.reply({
          content: '❌ ユーザーが指定されていません。',
          ephemeral: true
        });
      }

      await user.send(message);

      const embed = new EmbedBuilder()
        .setTitle('📤 DM送信成功')
        .setDescription(`✅ \`${user.tag}\` にDMを送信しました。`)
        .setColor('Green');

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      const embed = new EmbedBuilder()
        .setTitle('❌ DM送信失敗')
        .setDescription(`ユーザーにDMを送信できませんでした。\n\`\`\`txt\n${error.message}\n\`\`\``)
        .setColor('Red');

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
