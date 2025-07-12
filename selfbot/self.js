const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

const selfClient = new Client();

selfClient.on('ready', async () => {
  console.log(`🟢 セルフボット起動: ${selfClient.user.tag}`);

  selfClient.user.setPresence({
    status: 'online',
    activities: [
      {
        name: '中野三玖を推し中',
        type: 0, // 0 = Playing, 2 = Listening, 3 = Watching
        details: '今日も推し活',
      }
    ],
  });

  console.log('🎮 アクティビティを設定しました');
});

selfClient.login(process.env.SELF_TOKEN);

module.exports = selfClient;
