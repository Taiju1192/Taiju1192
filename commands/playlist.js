const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require("discord.js");
const tracks = require("../data/tracks");
const activePlayers = require("../activePlayers");
const {
  joinVoiceChannel,
  createAudioPlayer,
  entersState,
  VoiceConnectionStatus,
  createAudioResource,
  AudioPlayerStatus,
  StreamType
} = require("@discordjs/voice");
const { spawn } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("ffmpeg-static");
const https = require("https");

const TRACKS_PER_PAGE = 10;

function paginateTracks(page) {
  const start = page * TRACKS_PER_PAGE;
  return tracks.slice(start, start + TRACKS_PER_PAGE);
}

async function createAudioResourceFromSrc(src) {
  let audioPath = src;
  if (audioPath.startsWith("http")) {
    const extension = path.extname(new URL(audioPath).pathname) || ".mp3";
    const tempPath = path.join(os.tmpdir(), `audio_${Date.now()}${extension}`);
    const file = fs.createWriteStream(tempPath);
    await new Promise((resolve, reject) => {
      https.get(audioPath, (res) => {
        if (res.statusCode !== 200) return reject();
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      }).on("error", reject);
    });
    audioPath = tempPath;
  }
  const ffmpeg = spawn(ffmpegPath, ["-i", audioPath, "-vn", "-f", "s16le", "-ar", "48000", "-ac", "2", "pipe:1"]);
  return createAudioResource(ffmpeg.stdout, { inputType: StreamType.Raw, inlineVolume: true });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("曲一覧を表示し、選択して再生します。"),

  async execute(interaction) {
    await interaction.deferReply();
    let currentPage = 0;

    const updateComponents = (page) => {
      const pageTracks = paginateTracks(page);
      const embed = new EmbedBuilder()
        .setTitle(`🎵 プレイリスト - ページ ${page + 1}`)
        .setDescription(pageTracks.map((track, i) => `${i + 1 + page * TRACKS_PER_PAGE}. ${track.title}`).join("\n"));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("select_track")
        .setPlaceholder("曲を選択してください")
        .addOptions(pageTracks.map((track, i) => ({
          label: track.title.length > 100 ? track.title.slice(0, 97) + "..." : track.title,
          value: String(i + page * TRACKS_PER_PAGE),
        })));

      const row1 = new ActionRowBuilder().addComponents(selectMenu);
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("prev_page").setLabel("⬅ 前").setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId("next_page").setLabel("次 ➡").setStyle(ButtonStyle.Secondary).setDisabled((page + 1) * TRACKS_PER_PAGE >= tracks.length)
      );

      return { embed, components: [row1, row2] };
    };

    const { embed, components } = updateComponents(currentPage);
    const reply = await interaction.editReply({ embeds: [embed], components });

    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
    const menuCollector = reply.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: "あなたの操作ではありません。", ephemeral: true });
      if (i.customId === "prev_page") currentPage--;
      else if (i.customId === "next_page") currentPage++;
      const { embed, components } = updateComponents(currentPage);
      await i.update({ embeds: [embed], components });
    });

    menuCollector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: "あなたの操作ではありません。", ephemeral: true });

      const selectedIndex = parseInt(i.values[0]);
      const selectedTrack = tracks[selectedIndex];

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) return i.reply({ content: "🔊 ボイスチャンネルに入ってください。", ephemeral: true });

      const guildId = interaction.guild.id;
      if (activePlayers.has(guildId)) return i.reply({ content: "❗ すでに再生中です。/stop で止めてください。", ephemeral: true });

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
        const player = createAudioPlayer();
        const resource = await createAudioResourceFromSrc(selectedTrack.src);
        player.play(resource);
        connection.subscribe(player);

        activePlayers.set(guildId, {
          connection,
          player,
          queue: [],
          currentTrack: selectedTrack,
          interaction,
        });

        player.on(AudioPlayerStatus.Idle, () => {
          connection.destroy();
          activePlayers.delete(guildId);
        });

        await i.update({ content: `▶️ 再生中: **${selectedTrack.title}**`, embeds: [], components: [] });
      } catch (err) {
        console.error("❌ 再生エラー", err);
        await i.update({ content: "❌ 再生できませんでした。", embeds: [], components: [] });
        connection.destroy();
      }
    });
  }
};
