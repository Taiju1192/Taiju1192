const { EmbedBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "music_settings") {
        const selectedValue = interaction.values[0]; // 選ばれた値
        const connection = getVoiceConnection(interaction.guild.id); // ボイスチャンネルの接続取得

        let embed = new EmbedBuilder().setColor("Blue");

        switch (selectedValue) {
          case "volume":
            embed.setTitle("音量設定");
            const volumeMenu = new StringSelectMenuBuilder()
              .setCustomId("volume_select")
              .setPlaceholder("音量を選んでください")
              .addOptions([
                { label: "0.1", value: "0.1", emoji: "🔊" },
                { label: "0.2", value: "0.2", emoji: "🔊" },
                { label: "0.3", value: "0.3", emoji: "🔊" },
                { label: "0.4", value: "0.4", emoji: "🔊" },
                { label: "0.5", value: "0.5", emoji: "🔊" },
                { label: "0.6", value: "0.6", emoji: "🔊" },
                { label: "0.7", value: "0.7", emoji: "🔊" },
                { label: "0.8", value: "0.8", emoji: "🔊" },
                { label: "0.9", value: "0.9", emoji: "🔊" },
                { label: "1.0", value: "1.0", emoji: "🔊" },
              ]);
            interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(volumeMenu)] });
            break;

          case "speed":
            embed.setTitle("スピード設定");
            const speedMenu = new StringSelectMenuBuilder()
              .setCustomId("speed_select")
              .setPlaceholder("スピードを選んでください")
              .addOptions([
                { label: "0.5倍", value: "0.5", emoji: "⏩" },
                { label: "1倍", value: "1", emoji: "⏩" },
                { label: "1.25倍", value: "1.25", emoji: "⏩" },
                { label: "1.5倍", value: "1.5", emoji: "⏩" },
                { label: "2倍", value: "2", emoji: "⏩" },
              ]);
            interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(speedMenu)] });
            break;

          case "repeat":
            embed.setTitle("リピート設定");
            // ここでリピート処理（再生中の曲をループする）を実装
            embed.setDescription("リピートモードが変更されました");
            interaction.reply({ embeds: [embed], components: [] });
            break;

          case "shuffle":
            embed.setTitle("シャッフル設定");
            // ここでシャッフル処理（キュー内の曲をシャッフル）を実装
            embed.setDescription("シャッフルモードが変更されました");
            interaction.reply({ embeds: [embed], components: [] });
            break;
        }
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "volume_select") {
        const selectedVolume = interaction.values[0];
        // 音量の変更を実装
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
          connection.state.subscription.player.volume = parseFloat(selectedVolume);
        }
        await interaction.update({ content: `音量が${selectedVolume}に設定されました。`, components: [] });
      }

      if (interaction.customId === "speed_select") {
        const selectedSpeed = interaction.values[0];
        // スピードの変更を実装
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
          // speed設定処理（例えば、音楽ライブラリに依存）
        }
        await interaction.update({ content: `スピードが${selectedSpeed}に設定されました。`, components: [] });
      }
    }
  },
};
