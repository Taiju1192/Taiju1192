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
require("./prefix-handler"); // 任意のプリフィックス処理（不要なら削除OK）

// ✅ Bot クライアントの初期化（Intent & Partial 設定）
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,          // ✅ メッセージ内容を取得
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions    // ✅ リアクションを監視
  ],
  partials: [
    Partials.Channel,
    Partials.Message,     // ✅ キャッシュ外のメッセージ対応
    Partials.Reaction,    // ✅ キャッシュ外のリアクション対応
    Partials.User         // ✅ キャッシュ外のユーザー情報対応
  ]
});

// ✅ コマンド登録用
client.commands = new Collection();
const commands = [];

// ✅ コマンド読み込み（./commands）
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.data.name) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else if (command.name) {
    client.commands.set(command.name, command);
  } else {
    console.warn(`[WARN] コマンドファイル ${file} に有効な構造がありません。スキップされました。`);
  }
}

// ✅ メッセージ監視イベント
client.on("messageCreate", async (message) => {
  console.log(`[受信] ${message.author.tag}: ${message.content}`); // 🔍 ログ確認用
  if (message.author.bot) return;

  const googleCommand = client.commands.get("google-reaction");
  if (googleCommand && typeof googleCommand.handle === "function") {
    await googleCommand.handle(message, client);
  }
});

// ✅ イベント読み込み（./events）
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

// ✅ Discord Bot にログイン
client.login(process.env.DISCORD_TOKEN);

// ✅ スラッシュコマンドをギルドに登録
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

// ✅ Render用 Web サーバー（ヘルスチェック）
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webサーバー起動中: ポート ${PORT}`);
});
