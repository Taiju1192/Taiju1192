require("dotenv").config();
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Events, 
  Collection, 
  REST, 
  Routes 
} = require("discord.js");
const fs = require("fs");
const express = require("express");

// === activePlayersを読み込んで使えるようにする ===
const activePlayers = require('./activePlayers'); // ← ここを追加！

// client 初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// activePlayers を client にアタッチ（どのコマンドでも使えるように）
client.activePlayers = activePlayers;

// コマンド読み込み
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

const commands = [];
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

// スラッシュコマンド登録
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔁 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Successfully registered application commands.');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();

client.once(Events.ClientReady, () => {
  console.log(`✅ Botログイン成功: ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("コマンド実行エラー:", error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "コマンドの実行中にエラーが発生しました。", ephemeral: true });
    } else {
      await interaction.reply({ content: "コマンドの実行中にエラーが発生しました。", ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

// ホスティング用監視ルート
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server is listening on port ${PORT}`);
});
