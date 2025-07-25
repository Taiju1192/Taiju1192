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
} catch (e) {
  console.warn("⚠️ activePlayers.js が見つかりません（省略可能）");
}

// ✅ コマンド読み込み
client.commands = new Collection();
const commands = [];
const commandFiles = fs.existsSync("./commands") ? getAllJsFilesRecursive("./commands") : [];

function getAllJsFilesRecursive(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...getAllJsFilesRecursive(filePath));
    } else if (file.name.endsWith(".js")) {
      results.push(filePath);
    }
  }
  return results;
}

for (const filePath of commandFiles) {
  const command = require(filePath);
  if (command.data && command.data.name) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else if (command.name) {
    client.commands.set(command.name, command);
  } else {
    console.warn(`[WARN] コマンドファイル ${filePath} は無効な形式です`);
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
  client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log("🔐 Discord login success!"))
    .catch(err => {
      console.error("❌ Discord login failed:", err);
      process.exit(1);
    });
}

// ✅ スラッシュコマンド登録とアクティビティ設定
client.once("ready", async () => {
  console.log(`✅ Botログイン成功: ${client.user.tag}`);
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    // ✅ まず既存のグローバルコマンドを削除
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );
    console.log("🧹 既存のグローバルコマンドを削除しました");

    // ✅ 新しいコマンドを登録
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("🌐 新しいグローバルコマンドを登録しました（最大1時間で反映）");

  } catch (error) {
    console.error("❌ スラッシュコマンド登録エラー:", error);
  }

  // ✅ アクティビティ設定
  try {
    require("./activity")(client);
  } catch (err) {
    console.warn("⚠️ activity.js が見つかりません（省略可能）");
  }
});


// ✅ Web サーバー（サイト表示）
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
