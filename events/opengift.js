const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isModalSubmit() && interaction.customId === 'opengift-modal') {
      const type = interaction.fields.getTextInputValue('gift-type').toLowerCase();
      const rawVal = interaction.fields.getTextInputValue('gift-value');
      
      let description = '';
      let label = '受け取る';
      let customId = `opengift_${Date.now()}_${type}`;

      switch (type) {
        case 'url':
          description = `公開配布（URL方式）`;
          break;
        case 'text':
          description = `公開配布（テキスト方式）`;
          break;
        case 'file':
          description = `公開配布（ファイル方式）\n※受け取る人はファイル選択後に DM されます。`;
          break;
        default:
          await interaction.reply({ content: 'タイプは url / text / file のいずれかで指定してください', ephemeral: true });
          return;
      }

      const embed = new EmbedBuilder()
        .setTitle('公開配布')
        .setDescription(description)
        .addFields({ name: '概要', value: rawVal || '_（ファイル選択可）_' });

      const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({ embeds: [embed], components: [row] });

      // store payload for later; simple in-memory store
      interaction.client._openGifts = interaction.client._openGifts || {};
      interaction.client._openGifts[customId] = { type, value: rawVal, filePath: null };
    }

    if (interaction.isButton() && interaction.customId.startsWith('opengift_')) {
      const payload = interaction.client._openGifts?.[interaction.customId];
      if (!payload) return;
      
      try {
        const user = interaction.user;

        if (payload.type === 'url') {
          await user.send({ embeds: [new EmbedBuilder().setTitle('📦 ご配布URL').setDescription(payload.value)] });
        }
        else if (payload.type === 'text') {
          await user.send({ embeds: [new EmbedBuilder().setTitle('📦 ご配布内容').setDescription(payload.value)] });
        }
        else if (payload.type === 'file') {
          // ここでファイル選択を促す
          await user.send({ content: '📂 配布したいファイルをこちらにアップロードしてください。' });
          const filter = m => m.author.id === user.id && m.attachments.size > 0;
          const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
          const attachment = collected.first().attachments.first();
          if (!attachment) throw new Error('ファイルが取得できませんでした');

          await user.send({ files: [attachment.url] });
        }

        await interaction.reply({ content: '✅ DM に送信しました！', ephemeral: true });
      } catch (err) {
        console.error(err);
        const errEmbed = new EmbedBuilder()
          .setTitle('⚠️ DM送信できませんでした')
          .setDescription('DMが設定されていないか、送信が拒否されました。\n```\n' + (err.message || err) + '\n```');
        await interaction.reply({ embeds: [errEmbed], ephemeral: true });
      }
    }
  }
};
