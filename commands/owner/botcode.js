const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
  PermissionFlagsBits
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const TARGET_FOLDER = path.join(__dirname, '..'); // commands以下を対象
const PERMITTED_USER_ID = '1365228588261052499';
const FILES_PER_PAGE = 25;

function getAllJsFiles(dir, prefix = '') {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let result = [];

  for (const file of files) {
    const relPath = path.join(prefix, file.name);
    if (file.isDirectory()) {
      result.push(...getAllJsFiles(path.join(dir, file.name), relPath));
    } else if (file.name.endsWith('.js')) {
      result.push(relPath);
    }
  }

  return result;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botcode')
    .setDescription('ファイルコードを表示（開発者限定）'),
  async execute(interaction) {
    if (interaction.user.id !== PERMITTED_USER_ID) {
      return interaction.reply({ content: 'このコマンドは使用できません。', ephemeral: true });
    }

    const files = getAllJsFiles(TARGET_FOLDER);
    if (files.length === 0) {
      return interaction.reply({ content: '対象ファイルが見つかりません。', ephemeral: true });
    }

    let page = 0;
    const maxPage = Math.ceil(files.length / FILES_PER_PAGE);

    const createComponents = (pageIndex) => {
      const pageFiles = files.slice(pageIndex * FILES_PER_PAGE, (pageIndex + 1) * FILES_PER_PAGE);

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`botcode_select_${pageIndex}`)
        .setPlaceholder('ファイルを選択')
        .addOptions(
          pageFiles.map(file => ({
            label: file.length > 100 ? file.slice(0, 100) : file,
            value: file
          }))
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev_page')
          .setLabel('←')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === 0),
        new ButtonBuilder()
          .setCustomId('next_page')
          .setLabel('→')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex >= maxPage - 1)
      );

      return [row, ...(maxPage > 1 ? [buttonRow] : [])];
    };

    const embed = new EmbedBuilder()
      .setTitle('📁 Bot Code Viewer')
      .setDescription('表示するファイルを選択してください。')
      .setColor('Blurple');

    await interaction.reply({
      embeds: [embed],
      components: createComponents(page),
      ephemeral: true
    });

    const message = await interaction.fetchReply();

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 5 * 60_000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'これはあなたの操作ではありません。', ephemeral: true });
      }

      const filePath = path.join(TARGET_FOLDER, i.values[0]);
      const code = fs.readFileSync(filePath, 'utf8');

      const chunks = code.match(/[\s\S]{1,1900}/g); // DMの制限対策

      try {
        const dm = await i.user.createDM();
        await dm.send(`📄 **${i.values[0]}** の内容:`);

        for (const chunk of chunks) {
          await dm.send({ content: `\`\`\`js\n${chunk}\n\`\`\`` });
        }

        await i.reply({ content: '✅ DMに送信しました！', ephemeral: true });
      } catch (err) {
        await i.reply({ content: '❌ DMの送信に失敗しました。DMを開放してください。', ephemeral: true });
      }
    });

    // ページボタン
    const btnCollector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60_000
    });

    btnCollector.on('collect', async btn => {
      if (btn.user.id !== interaction.user.id) {
        return btn.reply({ content: 'これはあなたの操作ではありません。', ephemeral: true });
      }

      if (btn.customId === 'prev_page' && page > 0) page--;
      if (btn.customId === 'next_page' && page < maxPage - 1) page++;

      await btn.update({
        components: createComponents(page)
      });
    });
  },
};
