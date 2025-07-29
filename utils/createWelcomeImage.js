const { createCanvas, loadImage } = require('@napi-rs/canvas');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

module.exports = async function createWelcomeImage(username, userId, avatarURL, type = 'join') {
  const width = 1365;
  const height = 768;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景画像読み込み（/mnt/data に保存された画像）
  const bgPath = path.join(
    '/mnt/data',
    type === 'join' ? 'welcome.png' : 'takecare.png'
  );

  try {
    const bgImage = await loadImage(fs.readFileSync(bgPath));
    ctx.drawImage(bgImage, 0, 0, width, height);
  } catch (err) {
    console.error('背景画像読み込み失敗:', err);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, width, height);
  }

  // 👤 アバター描画（背景の丸の中央に合わせる）
  try {
    const resp = await axios.get(avatarURL, { responseType: 'arraybuffer' });
    const avatar = await loadImage(resp.data);
    const size = 300;
    const centerX = 285; // 背景の丸の中心X
    const centerY = 380; // 背景の丸の中心Y

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, centerX - size / 2, centerY - size / 2, size, size);
    ctx.restore();
  } catch (err) {
    console.error('アバター描画失敗:', err);
  }

  // 🆔 ユーザー名とID（アイコンの下に薄く表示）
  ctx.fillStyle = type === 'join' ? '#ffffff' : '#222222';
  ctx.font = 'bold 30px Sans';
  ctx.fillText(username, 110, 610); // 左下の文字（名前）

  ctx.font = '22px Sans';
  ctx.fillText(`ID: ${userId}`, 110, 650); // 左下の文字（ID）

  return canvas.toBuffer('image/png');
};
