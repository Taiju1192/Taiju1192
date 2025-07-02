const express = require("express");
require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Events, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
require('./prefix-handler');

// Botクライアントの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// コマンドの読み込み
client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

const commands = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON()); // 登録用
}

// BotがReadyになったとき
client.once(Events.ClientReady, async () => {
  console.log(`✅ Botログイン成功: ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log("🔄 スラッシュコマンドを2つのギルドに登録しています...");

    // 1つ目のギルドに登録
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log(`✅ ギルド ${process.env.GUILD_ID} に登録完了！`);

    // 2つ目のギルドに登録
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID2),
      { body: commands }
    );
    console.log(`✅ ギルド ${process.env.GUILD_ID2} に登録完了！`);

    console.log("✅ スラッシュコマンド登録完了！");
  } catch (error) {
    console.error("❌ コマンド登録エラー:", error);
  }
});

// コマンド実行イベント
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

// Botログイン
client.login(process.env.DISCORD_TOKEN);

// Webサーバー（Render対応など）
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web server is listening on port ${PORT}`);
});
