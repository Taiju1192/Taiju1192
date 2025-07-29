const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('このサーバーの詳細情報を表示します'),

  async execute(interaction) {
    const { guild } = interaction;
    const owner = await guild.fetchOwner();

    // メンバー内訳（BOT / ユーザー）
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const humanCount = totalMembers - botCount;

    // チャンネル数（タイプ別）
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;

    // その他情報
    const roleCount = guild.roles.cache.size;
    const emojiCount = guild.emojis.cache.size;
    const boostCount = guild.premiumSubscriptionCount;
    const boostTier = guild.premiumTier;
    const verificationLevel = guild.verificationLevel;
    const createdAt = `<t:${Math.floor(guild.createdAt.getTime() / 1000)}:F>`; // 相対日付表示

    const embed = new EmbedBuilder()
      .setTitle('📊 サーバー情報')
      .setColor(0x3498db)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'サーバー名', value: guild.name, inline: true },
        { name: 'サーバーID', value: guild.id, inline: true },
        { name: 'オーナー', value: `${owner.user.tag}`, inline: true },
        { name: '作成日', value: `${createdAt}`, inline: true },
        { name: 'メンバー数', value: `👤 ${humanCount} ユーザー\n🤖 ${botCount} BOT`, inline: true },
        { name: 'チャンネル数', value: `💬 テキスト: ${textChannels}\n🔊 ボイス: ${voiceChannels}`, inline: true },
        { name: 'ロール数', value: `${roleCount}`, inline: true },
        { name: 'カスタム絵文字数', value: `${emojiCount}`, inline: true },
        { name: 'ブースト', value: `🚀 レベル ${boostTier}（${boostCount} ブースト）`, inline: true },
        { name: '認証レベル', value: `${verificationLevel}`, inline: true }
      )
      .setFooter({ text: `サーバー情報 - ${guild.name}`, iconURL: guild.iconURL() });

    await interaction.reply({ embeds: [embed] });
  }
};
