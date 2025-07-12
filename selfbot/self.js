// 📁 selfbot/self.js
const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

const selfClient = new Client();

selfClient.on('ready', () => {
  console.log(`🟢 セルフボット起動: ${selfClient.user.tag}`);

  selfClient.user.setPresence({
    activities: [
      {
        name: '中野三玖を視聴中',
        type: 4, // CUSTOM
        state: '中野三玖',
        assets: {
          largeImage: 'nakano_miku_img', // Developer Portal にアップロードした画像キー
          largeText: '中野三玖'
        }
      }
    ],
    status: 'online'
  });
});

selfClient.login(process.env.SELF_TOKEN);

module.exports = selfClient;

module.exports = selfClient;
