const express = require("express");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes
} = require("discord.js");
require("./prefix-handler"); // 必要なら残す

// Bot クライアント初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

// コマンド登録用コレクション
client.commands = new Collection();
const commands = [];

// コマンドファイル読み込み
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // Slash Command の場合（data.nameが存在）
  if (command.data && command.data.name) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }

  // 非Slash Command用（例：google.jsのhandle関数）
  else if (command.name) {
    client.commands.set(command.name, command);
  }

  // どちらもなければ警告
  else {
    console.warn(`[WARN] コマンドファイル ${file} に有効な構造がありません。スキップされました。`);
  }
}

// メッセージ監視イベント（google.jsなど）
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // メッセージハンドラを手動で呼び出す（例：google-reaction）
  const googleCommand = client.commands.get("google-reaction");
  if (googleCommand && typeof googleCommand.handle === "function") {
    await googleCommand.handle(message, client);
  }
});

// イベントファイル読み込み
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Botログイン
client.login(process.env.DISCORD_TOKEN);

// スラッシュコマンド登録（複数ギルドに対応）
client.once("ready", async () => {
  console.log(`✅ Botログイン成功: ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`✅ GUILD_ID にコマンド登録完了`);
    }

    if (process.env.GUILD_ID2) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID2),
        { body: commands }
      );
      console.log(`✅ GUILD_ID2 にコマンド登録完了`);
    }
  } catch (error) {
    console.error("❌ スラッシュコマンド登録エラー:", error);
  }
});

// Webサーバー（Render対応ヘルスチェック用）
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webサーバー起動中: ポート ${PORT}`);
});
