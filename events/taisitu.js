const { Events, AttachmentBuilder } = require('discord.js');
const createWelcomeImage = require('../utils/createWelcomeImage');

let lastLeaveId = null;
const TARGET_GUILD_ID = '1396396963292905523';
const TARGET_CHANNEL_ID = '1396402907053817866';

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    if (member.guild.id !== TARGET_GUILD_ID) return;
    if (member.id === lastLeaveId) return;
    lastLeaveId = member.id;

    const logChannel = member.guild.channels.cache.get(TARGET_CHANNEL_ID);
    if (!logChannel) return;

    try {
      const buffer = await createWelcomeImage(
        member.user.username,
        member.user.id,
        member.user.displayAvatarURL({ extension: 'png', size: 256 }),
        'leave'
      );

      const attachment = new AttachmentBuilder(buffer, { name: 'takecare.png' });

      await logChannel.send({
        content: `👋 <@${member.id}> がサーバーから退出しました。`,
        files: [attachment]
      });

      console.log('[LEAVE]', member.user.username);
    } catch (err) {
      console.error('退出画像生成または送信失敗:', err);
    }
  }
};
