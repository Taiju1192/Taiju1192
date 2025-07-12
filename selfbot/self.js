const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

const client = new Client();

client.on('ready', () => {
  console.log(`✅ セルフボット起動: ${client.user.tag}`);

  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: '中野三玖を推し中',
        type: 0, // PLAYING
      }
    ],
  });
});

selfClient.login(process.env.SELF_TOKEN);

module.exports = selfClient;
