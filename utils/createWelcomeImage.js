const { createCanvas, loadImage } = require('@napi-rs/canvas');
const axios = require('axios');
const path = require('path');

module.exports = async function createWelcomeImage(username, avatarURL, type = 'join') {
  const width = 800;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const bgPath = path.join(__dirname, type === 'join' ? '../assets/welcome.png' : '../assets/takecare.png');

  try {
    const background = await loadImage(bgPath);
    ctx.drawImage(background, 0, 0, width, height);
  } catch (e) {
    console.warn('背景画像読み込み失敗:', e.message);
    ctx.fillStyle = type === 'join' ? '#57f287' : '#ed4245';
    ctx.fillRect(0, 0, width, height);
  }

  // ユーザー名描画（調整可能）
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Sans';
  ctx.fillText(username, 50, 220);

  // アバター
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
