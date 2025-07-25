const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Collection
} = require('discord.js');

const cooldowns = new Collection(); // user.id -> timestamp
const COOLDOWN_MS = 30_000; // 30秒

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('他ユーザーにDMを送信（管理者専用）')
    // 必須オプションは先に書く（Discordの仕様）
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('送信内容')
        .setRequired(true)
    )
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('送信先ユーザー（選択）')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('user_id')
        .setDescription('送信先ユーザーID（手動入力）')
        .setRequired(false)
    ),

  async execute(interaction) {
    // 管理者チェック
    if (!interaction.guild || !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ このコマンドはサーバー内の「管理者」のみ使用可能です。',
        ephemeral: true
      });
    }

    const sender = interaction.user;
    const now = Date.now();

    // クールダウン確認
    const lastUsed = cooldowns.get(sender.id);
    if (lastUsed && now - lastUsed < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);

      const cooldownEmbed = new EmbedBuilder()
        .setTitle('⏳ クールダウン中です')
        .setDescription(
          'このコマンドは 30 秒ごとに 1 回だけ使用できます。\n' +
          '次に使用できるまでの残り時間：\n' +
          '```js\n' + `${remaining} 秒` + '\n```'
        )
        .setColor('Orange')
        .setTimestamp();

      return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
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
          content: '❌ 宛先が指定されていません。',
          ephemeral: true
        });
      }

      // 📩 宛先に送る DM
      const embedToRecipient = new EmbedBuilder()
        .setTitle('📩 メッセージを受信しました')
        .addFields(
          { name: '送信者', value: `\`${sender.tag}\`（ID: \`${sender.id}\`）` },
          { name: '内容', value: `\`\`\`\n${message}\n\`\`\`` }
        )
        .setFooter({ text: 'このメッセージはBot経由で送信されました。' })
        .setColor('Blue')
        .setTimestamp();

      await recipient.send({ embeds: [embedToRecipient] });

      // ✅ 実行者に送信結果をDM
      const embedToSender = new EmbedBuilder()
        .setTitle('📤 DM送信完了')
        .addFields(
          { name: '宛先', value: `\`${recipient.tag}\`（ID: \`${recipient.id}\`）` },
          { name: '送信内容', value: `\`\`\`\n${message}\n\`\`\`` }
        )
        .setColor('Green')
        .setTimestamp();

      try {
        await sender.send({ embeds: [embedToSender] });
      } catch {
        // 実行者がDM拒否している場合は無視
      }

      await interaction.reply({
        content: `✅ \`${recipient.tag}\` にDMを送信しました。`,
        ephemeral: true
      });

    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ エラーが発生しました')
        .setDescription(`\`\`\`txt\n${err.message}\n\`\`\``)
        .setColor('Red');

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
