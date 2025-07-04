const express = require("express");
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

// 🚀 起動ログ
console.log("🚀 起動開始");

// ✅ 環境変数デバッグ表示（Render の設定ミスを検出）
console.log("DISCORD_TOKEN:", !!process.env.DISCORD_TOKEN);
console.log("CLIENT_ID:", process.env.CLIENT_ID || "❌ 未設定");
console.log("GUILD_ID:", process.env.GUILD_ID || "❌ 未設定");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User
  ]
});

// ✅ コマンド登録用
client.commands = new Collection();
const commands = [];

// ✅ ./commands フォルダからコマンド読み込み
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.data.name) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else if (command.name) {
    client.commands.set(command.name, command);
  } else {
    console.warn(`[WARN] 無効なコマンド構造: ${file}`);
  }
}

// ✅ メッセージイベントでコマンド発火（例：google-reaction）
client.on("messageCreate", async (message) => {
  console.log(`[受信] ${message.author.tag}: ${message.content}`);
  if (message.author.bot) return;

  const googleCommand = client.commands.get("google-reaction");
  if (googleCommand && typeof googleCommand.handle === "function") {
    await googleCommand.handle(message, client);
  }
});

// ✅ ./events フォルダからイベント読み込み
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

// ✅ Discord Bot にログイン（失敗時のログ付き）
if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN が読み込まれていません。環境変数を確認してください。");
} else {
  client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log("🔐 Discord login success!"))
    .catch(err => console.error("❌ Discord login failed:", err));
}

// ✅ Bot 起動後のスラッシュコマンド登録
client.once("ready", async () => {
  console.log(`✅ Botログイン成功: ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log("✅ GUILD_ID にコマンド登録完了");
    }

    if (process.env.GUILD_ID2) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID2),
        { body: commands }
      );
      console.log("✅ GUILD_ID2 にコマンド登録完了");
    }
  } catch (error) {
    console.error("❌ スラッシュコマンド登録エラー:", error);
  }
});

// ✅ Render 用の Web サーバー（ヘルスチェック）
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webサーバー起動中: ポート ${PORT}`);
});
