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
require("dotenv").config();

console.log("🚀 起動開始");
console.log("DISCORD_TOKEN:", !!process.env.DISCORD_TOKEN);
console.log("CLIENT_ID:", process.env.CLIENT_ID || "❌ 未設定");
console.log("GUILD_ID:", process.env.GUILD_ID || "❌ 未設定");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User
  ]
});

// ✅ activePlayers 読み込み（存在しない場合はスキップ）
try {
  client.activePlayers = require("./activePlayers");
  console.log("🎵 activePlayers を読み込みました");
} catch {
  console.warn("⚠️ activePlayers.js が見つかりません（省略可能）");
}

// ✅ コマンド読み込み（サブフォルダも対応）
client.commands = new Collection();
const commands = [];

function getAllJsFilesRecursive(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllJsFilesRecursive(fullPath));
    } else if (entry.name.endsWith(".js")) {
      results.push(fullPath);
    }
  }
  return results;
}

const commandFiles = getAllJsFilesRecursive(path.join(__dirname, "commands"));

for (const filePath of commandFiles) {
  try {
    const command = require(filePath);
    if (command.data && command.data.name) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else if (command.name) {
      client.commands.set(command.name, command);
    } else {
      console.warn(`[WARN] 無効なコマンド形式: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ コマンドの読み込み失敗: ${filePath}`);
    console.error(err);
  }
}

// ✅ イベント読み込み
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

// ✅ Discord ログイン
if (!process.env.DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN が設定されていません。");
} else {
  console.log("🟡 client.login() を呼び出します...");
  client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log("🟢 Discord login success!"))
    .catch(err => {
      console.error("🔴 Discord login failed:");
      console.error(err);
      process.exit(1);
    });
}

// ✅ スラッシュコマンド登録とアクティビティ設定
client.once("ready", async () => {
  console.log(`✅ Botログイン成功: ${client.user.tag}`);
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    // ✅ コマンド登録先（グローバル or ギルド限定）
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    // ✅ コマンド上書き登録
    await rest.put(route, { body: commands });
    console.log(process.env.GUILD_ID
      ? "🏠 ギルドコマンドを登録しました"
      : "🌐 グローバルコマンドを登録しました（最大1時間で反映）");
  } catch (error) {
    console.error("❌ スラッシュコマンド登録エラー:", error);
  }

  // ✅ アクティビティ設定（任意）
  try {
    require("./activity")(client);
  } catch {
    console.warn("⚠️ activity.js が見つかりません（省略可能）");
  }
});

// ✅ Web サーバー（静的サイト）
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webサーバー起動中: http://localhost:${PORT}`);
});

