const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    try {
      // 🔢 電卓ハンドラー
      const calculator = require("./calculator");
      if (await calculator(interaction)) return;

      // 🎵 音楽設定ハンドラー
      const musicSetting = require("./music-setting");
      if (await musicSetting(interaction, client)) return;

      // ⚙️ スラッシュコマンド（デフォルト）
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
      }

    } catch (err) {
      console.error("❌ interactionCreate.js エラー:", err);
    }
  }
};
