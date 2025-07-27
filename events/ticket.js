const { Events, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const activeTicketUsers = new Set();
const activeTicketChannels = new Set();
const deletedChannels = new Set();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    // 🎫 チケット作成ボタン
    if (
      interaction.isButton() &&
      interaction.customId.startsWith('ticket-') &&
      !interaction.customId.startsWith('ticket-close-')
    ) {
      const userId = interaction.user.id;
      if (activeTicketUsers.has(userId)) return;
      activeTicketUsers.add(userId);

      const existing = interaction.guild.channels.cache.find(c =>
        c.name.includes(`（${interaction.user.username}）`) &&
        c.name.startsWith('🎫｜')
      );
      if (existing) {
        await interaction.reply({
          content: '⚠️ 既にあなたのチケットが存在します：<#' + existing.id + '>',
          ephemeral: true
        });
        activeTicketUsers.delete(userId);
        return;
      }

      try {
        // 応答を早めに送信（インタラクションが失効する前に）
        await interaction.deferUpdate();

        const [, , categoryId, roleId, userIdMeta, adminRoleId, logChannelId] =
          interaction.customId.split('-');

        console.log('Custom ID:', interaction.customId); // customId全体を表示
        console.log('Log Channel ID:', logChannelId); // logChannelIdを表示

        if (!logChannelId || logChannelId === 'null') {
          console.warn('Log Channel ID is invalid or not provided.');
          return;
        }

        const guild = interaction.guild;
        const category =
          guild.channels.cache.get(categoryId) ||
          guild.channels.cache.find(c => c.type === ChannelType.GuildCategory);
        const role = guild.roles.cache.get(roleId);
        const user = guild.members.cache.get(userIdMeta);
        const adminRole = guild.roles.cache.get(adminRoleId);
        const logChannel = guild.channels.cache.get(logChannelId);

        if (!logChannel) {
          console.warn('Log channel could not be found or is invalid.');
          return;
        }

        const displayName = interaction.member.displayName.replace(/[^a-zA-Z0-9ぁ-んァ-ン一-龥()（）ー・\-\_\s]/g, '');
        const channelName = `🎫｜${displayName}（${interaction.user.username}）`.slice(0, 100);

        const channel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category?.id,
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: interaction.user.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            },
            ...(adminRole ? [{
              id: adminRole.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels]
            }] : []),
            ...guild.members.cache
              .filter(m => m.permissions.has(PermissionFlagsBits.Administrator))
              .map(m => ({
                id: m.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
              }))
          ]
        });

        const mentions = [
          `<@${interaction.user.id}>`,
          role ? `<@&${role.id}>` : null,
          user ? `<@${user.id}>` : null
        ].filter(Boolean).join(' ');

        const embed = new EmbedBuilder()
          .setTitle('📉 お問い合わせ')
          .setDescription('お問い合わせありがとうございます。\n内容を送信後、管理者をお待ちください。')
          .setColor(0x2ecc71)
          .setTimestamp();

        const deleteButton = new ButtonBuilder()
          .setCustomId(`ticket-close-${interaction.user.id}-${adminRole?.id || 'null'}-${logChannelId}`)
          .setLabel('チケット削除')
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(deleteButton);

        await channel.send({ content: mentions, embeds: [embed], components: [row] });

        if (logChannel?.isTextBased()) {
          console.log('Sending log to:', logChannel.id); 
          const logEmbed = new EmbedBuilder()
            .setTitle('🎫 チケット作成')
            .setDescription(`👤 <@${interaction.user.id}> が \`${channel.name}\` を作成しました。`)
            .setColor(0x00bfff)
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        } else {
          console.warn('Log channel is not valid or not a text channel.');
        }

      } catch (err) {
        console.error('❌ チケット作成エラー:', err);
      } finally {
        activeTicketUsers.delete(userId);
      }
    }
  }
};
