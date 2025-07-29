const { Events, AttachmentBuilder } = require('discord.js');
const createWelcomeImage = require('../utils/createWelcomeImage');

let lastJoinId = null;
const TARGET_GUILD_ID = '1396396963292905523';
const TARGET_CHANNEL_ID = '1396402907053817866';

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.guild.id !== TARGET_GUILD_ID) return;
    if (member.id === lastJoinId) return;
    lastJoinId = member.id;

    const logChannel = member.guild.channels.cache.get(TARGET_CHANNEL_ID);
    if (!logChannel) return;

    const buffer = await createWelcomeImage(
      member.user.username,
      member.user.displayAvatarURL({ size: 256, extension: 'png' }),
      'join'
    );
    const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

    await logChannel.send({
      content: `🎉 <@${member.id}> が入室しました！`,
      files: [attachment]
    });

    console.log('[JOIN]', member.user.username);
  }
};
