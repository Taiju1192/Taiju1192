// utils/createWelcomeImage.js
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const axios = require('axios');
const path = require('path');

module.exports = async function createWelcomeImage(username, avatarURL, type = 'join') {
  const width = 800;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景画像ファイルを読み込む
  const bgPath = path.join(__dirname, type === 'join' ? '../assets/welcome.png' : '../assets/takecare.png');
  try {
    const background = await loadImage(bgPath);
    ctx.drawImage(background, 0, 0, width, height);
  } catch (e) {
    console.warn('背景画像読み込み失敗:', e.message);
    ctx.fillStyle = type === 'join' ? '#57f287' : '#ed4245';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Sans';
  // Canva側のテキスト「WELCOME」「Take care」は背景に含まれている前提
  // ここでは username のみ描画
  ctx.fillText(username, 50, 120);

  // avatar を丸く描画
  try {
    const resp = await axios.get(avatarURL, { responseType: 'arraybuffer' });
    const avatar = await loadImage(resp.data);
    const size = 128;
    ctx.save();
    ctx.beginPath();
    ctx.arc(650, 125, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 650 - size / 2, 125 - size / 2, size, size);
    ctx.restore();
  } catch (e) {
    console.warn('アバター読み込み失敗:', e.message);
  }

  return canvas.toBuffer('image/png');
};
