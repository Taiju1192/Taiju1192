const express = require("express");
require("dotenv").config(); // ← Render では不要（環境変数は自動でセットされる）

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

require("./prefix-handler"); // 任意機能。なければ削除してもOK

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

// ✅ コマンド格納用コレクション
client.commands = new Collection();
const commands = [];

// ✅ ./commands フォルダからコマンドを読み込む
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

// ✅ メッセージイベントで google-reaction を処理
client.on("messageCreate", async (message) => {
  console.log(`[受信] ${message.author.tag}: ${message.content}`); // デバッグ用ログ
  if (message.author.bot) return;

  const googleCommand = client.commands.get("google-reaction");
  if (googleCommand && typeof googleCommand.handle === "function") {
    await googleCommand.handle(message, client);
  }
});

// ✅ ./events フォルダからイベントを読み込む
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
if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN が読み込まれていません。環境変数を確認してください。");
} else {
  client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("❌ client.login に失敗しました:", err);
  });
}

// ✅ スラッシュコマンド登録（GUILD単位）
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

// ✅ Render のヘルスチェック用 Web サーバー
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webサーバー起動中: ポート ${PORT}`);
});
