const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("calculator")
    .setDescription("小〜高1までの計算メニュー"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("📐 計算メニュー")
      .setDescription("学年ごとのテーマから計算ジャンルを選んでください。")
      .setColor("Green");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("calc_menu")
      .setPlaceholder("ジャンルを選択")
      .addOptions([
        { label: "四則演算", value: "basic_ops", description: "足し算、引き算、掛け算、割り算" },
        { label: "分数", value: "fraction", description: "通分・約分・帯分数など" },
        { label: "小数", value: "decimal", description: "小数の計算と分数との関係" },
        { label: "百分率・割合", value: "percent", description: "割合や割合の計算" },
        { label: "比・比例・反比例", value: "ratio", description: "比、比例、反比例" },
        { label: "文字式・展開・因数分解", value: "algebra", description: "文字と式の計算" },
        { label: "方程式", value: "equation", description: "一次・連立・二次方程式" },
        { label: "不等式", value: "inequality", description: "一次・連立不等式" },
        { label: "平方根", value: "root", description: "平方根の計算と有理化" },
        { label: "図形の計算", value: "geometry", description: "面積・体積・円・角度など" },
        { label: "関数", value: "function", description: "一次・二次関数の扱い" },
        { label: "三角比", value: "trigonometry", description: "三角比とその関係" },
        { label: "指数・対数", value: "log", description: "指数法則と対数の基本" },
        { label: "データの分析", value: "data", description: "平均・分散・度数分布" },
        { label: "速さ・時間・単位・確率", value: "misc", description: "速さ・単位変換・場合の数など" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: 64 // ✅ ephemeral の代替
    });
  }
};
