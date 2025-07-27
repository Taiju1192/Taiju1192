const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vending-set')
    .setDescription('自販機の設定を行います。')
    .addStringOption(option => 
      option.setName('action')
        .setDescription('アクションを選んでください（add, remove, price, refill）')
        .setRequired(true)
        .addChoices(
          { name: '商品追加', value: 'add' },
          { name: '商品削除', value: 'remove' },
          { name: '値段変更', value: 'price' },
          { name: '商品補充', value: 'refill' }
        )
    ),
  async execute(interaction) {
    const action = interaction.options.getString('action');
    
    const embed = new EmbedBuilder()
      .setTitle('自販機設定')
      .setDescription('自販機の設定を選択してください。')
      .setColor(0x0099ff);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('vending-action-add')
        .setLabel('商品追加')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('vending-action-remove')
        .setLabel('商品削除')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('vending-action-price')
        .setLabel('値段変更')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('vending-action-refill')
        .setLabel('商品補充')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
