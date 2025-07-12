const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

const selfClient = new Client();

selfClient.on('ready', () => {
  console.log(`✅ セルフボット起動: ${selfClient.user.tag}`);

  selfClient.user.setPresence({
    status: 'online',
    activities: [
      {
        name: '中野三玖  | 推し活中',
        type: 3 // WATCHING
      }
    ]
  });
});

selfClient.login(process.env.SELF_TOKEN); // ← selfClient が定義された後に呼ぶ

module.exports = selfClient;
