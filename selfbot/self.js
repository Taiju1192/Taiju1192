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
        type: 0, // PLAYING
        assets: {
          largeImage: 'nakano_miku_img', // Discord Developer Portal のキー名
          largeText: '中野三玖'
        }
      }
    ],
    status: 'online'
  });
});

selfClient.login(process.env.SELF_TOKEN);

module.exports = selfClient;
