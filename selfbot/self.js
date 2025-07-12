const { Client } = require('discord.js-selfbot-v13');
require('dotenv').config();

const selfClient = new Client();

selfClient.on('ready', () => {
  console.log(`🟢 セルフボット起動: ${selfClient.user.tag}`);
  // ステータスやプレゼンスの設定は不要
});

selfClient.login(process.env.SELF_TOKEN);

module.exports = selfClient;
