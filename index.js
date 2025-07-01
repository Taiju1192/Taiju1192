require("dotenv").config();
const { Client, GatewayIntentBits, Partials, Events, Collection } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

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
