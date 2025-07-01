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

// === activePlayers を他のコマンドでも使えるように読み込む ===
const activePlayers = require("./activePlayers");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// activePlayers を client にアタッチして全体で使えるように
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

// スラッシュコマンドを Discord に登録
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🔁 Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Successfully registered application commands.");
  } catch (error) {
    console.error("❌ Failed to register commands:", error);
  }
})();

// Bot ログイン時の確認
client.once(Events.ClientReady, () => {
  console.log(`✅ Botログイン成功: ${client.user.tag}`);
});

// スラッシュコマンドの処理
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("コマンド実行エラー:", error);

    try {
      // すでに応答済みかどうか確認
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "⚠️ コマンドの実行中にエラーが発生しました。",
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: "⚠️ コマンドの実行中にエラーが発生しました。",
          ephemeral: true
        });
      }
    } catch (err) {
      console.error("⚠️ 二重応答エラー:", err);
    }
  }
});

// Discord Bot を起動
client.login(process.env.DISCORD_TOKEN);

// Render などのホスティングで常時起動のために HTTP サーバーを追加
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server is listening on port ${PORT}`);
});
