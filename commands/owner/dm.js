const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Collection,
  time
} = require('discord.js');

const cooldowns = new Collection(); // user.id: timestamp
const COOLDOWN_MS = 30_000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('他ユーザーにDMを送信（管理者専用）')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('送信先のユーザー（選択）')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('user_id')
        .setDescription('送信先のユーザーID（手動入力）')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('送信するメッセージ')
        .setRequired(true)
    ),

  async execute(interaction) {
    // 権限チェック
    if (!interaction.guild || !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ このコマンドはサーバー内の「管理者」専用です。',
        ephemeral: true
      });
    }

    const sender = interaction.user;
    const now = Date.now();

    // クールダウンチェック
    const lastUsed = cooldowns.get(sender.id);
    if (lastUsed && now - lastUsed < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);
      return interaction.reply({
        content: `⏳ このコマンドは30秒ごとに1回だけ使用できます。あと ${remaining}秒 待ってください。`,
        ephemeral: true
      });
    }
    cooldowns.set(sender.id, now);

    const targetUser = interaction.options.getUser('user');
    const userId = interaction.options.getString('user_id');
    const message = interaction.options.getString('message');
    let recipient;

    try {
      if (targetUser) {
        recipient = targetUser;
      } else if (userId) {
        recipient = await interaction.client.users.fetch(userId);
      } else {
        return interaction.reply({
          content: '❌ ユーザーが指定されていません。',
          ephemeral: true
        });
      }

      // DM 送信内容
      const embedToRecipient = new EmbedBuilder()
        .setTitle('📩 新しいメッセージを受信しました')
        .addFields(
          { name: '送信者', value: `\`${sender.tag}\`（ID: \`${sender.id}\`）` },
          { name: 'メッセージ内容', value: `\`\`\`\n${message}\n\`\`\`` }
        )
        .setFooter({ text: 'このメッセージはBot経由で送信されました。' })
        .setTimestamp()
        .setColor('Blue');

      await recipient.send({ embeds: [embedToRecipient] });

      // 実行者にDMで送信確認
      const embedToSender = new EmbedBuilder()
        .setTitle('📤 メッセージを送信しました')
        .addFields(
          { name: '宛先', value: `\`${recipient.tag}\`（ID: \`${recipient.id}\`）` },
          { name: '送信内容', value: `\`\`\`\n${message}\n\`\`\`` }
        )
        .setColor('Green')
        .setTimestamp();

      try {
        await sender.send({ embeds: [embedToSender] });
      } catch {
        // 実行者がDM閉じてる場合は無視
      }

      await interaction.reply({
        content: `✅ \`${recipient.tag}\` にDMを送信しました。`,
        ephemeral: true
      });

    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ 送信エラー')
        .setDescription(`\`\`\`txt\n${err.message}\n\`\`\``)
        .setColor('Red');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
