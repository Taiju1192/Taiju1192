const { createCanvas, loadImage } = require('@napi-rs/canvas');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

module.exports = async function createWelcomeImage(username, userId, avatarURL, type = 'join') {
  const width = 1365;
  const height = 768;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 🔁 背景画像を assets フォルダから読み込み
  const bgPath = path.join(
    __dirname,
    '../assets',
    type === 'join' ? 'welcome.png' : 'takecare.png'
  );

  try {
    const bgImage = await loadImage(fs.readFileSync(bgPath));
    ctx.drawImage(bgImage, 0, 0, width, height);
  } catch (err) {
    console.error('背景画像読み込み失敗:', err);
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, width, height);
  }

  // 👤 アバター描画
  try {
    const resp = await axios.get(avatarURL, { responseType: 'arraybuffer' });
    const avatar = await loadImage(resp.data);
    const size = 280;
    const centerX = 340;
    const centerY = 384;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, centerX - size / 2, centerY - size / 2, size, size);
    ctx.restore();
  } catch (err) {
    console.error('アバター描画失敗:', err);
  }

  return canvas.toBuffer('image/png');
};
