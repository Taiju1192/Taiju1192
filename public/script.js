// 既存のコードはそのままに、新たにメディアセッションの設定を追加します。

const player = document.getElementById("player");
const skipBtn = document.getElementById("skip");
const shuffleBtn = document.getElementById("shuffle");
const playModeBtn = document.getElementById("playMode");
const repeatOneBtn = document.getElementById("repeatOneBtn");
const seek = document.getElementById("seek");
const tracklist = document.getElementById("tracklist");
const search = document.getElementById("search");

const nowPlayingEl = document.getElementById("nowPlaying");
const nextTrackEl = document.getElementById("nextTrack");

const volumeSlider = document.getElementById("volumeSlider");
const speedSlider = document.getElementById("speedSlider");
const muteBtn = document.getElementById("muteBtn");
const speedLabel = document.getElementById("speedLabel");

let currentTrack = 0;
let nextTrack = 1;
let playMode = "sequential";
let repeatOne = false;
let recentlyPlayed = [];

const RECENT_HISTORY_SIZE = 10;

// 音楽プレイヤーの操作設定
function createTrackList() {
  tracklist.innerHTML = "";
  tracks.forEach((track, i) => {
    const li = document.createElement("li");
    const titleSpan = document.createElement("span");
    titleSpan.textContent = track.title;
    titleSpan.style.cursor = "pointer";
    titleSpan.onclick = () => loadTrack(i);

    const downloadLink = document.createElement("a");
    downloadLink.href = track.src;
    downloadLink.textContent = "⬇️";
    downloadLink.setAttribute("download", "");
    downloadLink.style.marginLeft = "10px";
    downloadLink.title = "ダウンロード";

    li.appendChild(titleSpan);
    li.appendChild(downloadLink);
    tracklist.appendChild(li);
  });
}

// 現在の曲を変更
function loadTrack(index) {
  currentTrack = index;
  player.src = tracks[index].src;
  player.play();
  highlightCurrentTrack();
  addToRecentlyPlayed(index);
  determineNextTrack();
  updateNowNextDisplay();
  startTitleScroll(tracks[index].title);

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: tracks[index].title,
      artist: "アーティスト名",
      album: "アルバム名",
      artwork: [
        {
          src: "https://example.com/album_art.png",
          sizes: "300x300",
          type: "image/png"
        }
      ]
    });

    // メディアセッションで再生コントロールを設定
    navigator.mediaSession.setActionHandler('play', () => player.play());
    navigator.mediaSession.setActionHandler('pause', () => player.pause());
    navigator.mediaSession.setActionHandler('nexttrack', () => skipToNextTrack());
  }
}

// 次の曲にスキップ
function skipToNextTrack() {
  nextTrack = (currentTrack + 1) % tracks.length;
  loadTrack(nextTrack);
}

// 現在の曲をハイライト
function highlightCurrentTrack() {
  const lis = tracklist.querySelectorAll("li");
  lis.forEach((li, i) => {
    li.style.fontWeight = i === currentTrack ? "bold" : "normal";
  });
}

// 再生モードの切り替え
playModeBtn.addEventListener("click", () => {
  playMode = playMode === "sequential" ? "random" : "sequential";
  updatePlayModeButton();
  alert(playMode === "random" ? "ランダム再生モードに切り替えました！" : "順番再生モードに切り替えました！");
});

// シャッフルボタン
shuffleBtn.addEventListener("click", () => {
  playMode = "random";
  recentlyPlayed = [];
  updatePlayModeButton();
  skipToNextTrack();
  alert("シャッフル再生を開始しました！");
});

// スキップボタン
skipBtn.addEventListener("click", () => {
  skipToNextTrack();
});

function updatePlayModeButton() {
  playModeBtn.textContent = playMode === "sequential" ? "🔁 順番再生" : "🔀 ランダム再生";
  playModeBtn.classList.toggle("random-mode", playMode === "random");
}

// スクロールタイトルを設定
function startTitleScroll(trackTitle) {
  let title = `🎵 Now Playing: ${trackTitle} — `;
  let scrollIndex = 0;
  setInterval(() => {
    document.title = title.substring(scrollIndex) + title.substring(0, scrollIndex);
    scrollIndex = (scrollIndex + 1) % title.length;
  }, 100);
}

// 曲を検索
search.addEventListener("input", () => {
  const value = search.value.toLowerCase();
  const filtered = tracks.filter(t => t.title.toLowerCase().includes(value));
  tracklist.innerHTML = "";
  filtered.forEach((track, i) => {
    const li = document.createElement("li");
    const titleSpan = document.createElement("span");
    titleSpan.textContent = track.title;
    titleSpan.style.cursor = "pointer";
    titleSpan.onclick = () => loadTrack(i);

    const downloadLink = document.createElement("a");
    downloadLink.href = track.src;
    downloadLink.textContent = "⬇️";
    downloadLink.setAttribute("download", "");
    downloadLink.style.marginLeft = "10px";
    downloadLink.title = "ダウンロード";

    li.appendChild(titleSpan);
    li.appendChild(downloadLink);
    tracklist.appendChild(li);
  });
});

// 初期化
createTrackList();
loadTrack(0);

// 🎛 設定パネル制御
const settingsButton = document.getElementById("settingsButton");
const floatingSettings = document.getElementById("floatingSettings");
settingsButton.addEventListener("click", (e) => {
  e.preventDefault();
  floatingSettings.classList.remove("hidden");
  setTimeout(() => floatingSettings.classList.add("show"), 10);
});

document.addEventListener("click", (e) => {
  if (floatingSettings.classList.contains("show") && !floatingSettings.contains(e.target) && e.target !== settingsButton) {
    floatingSettings.classList.remove("show");
    setTimeout(() => floatingSettings.classList.add("hidden"), 500);
  }
});

// 音量スライダー
volumeSlider.addEventListener("input", () => {
  player.volume = parseFloat(volumeSlider.value);
});

// 再生速度スライダー
speedSlider.addEventListener("input", () => {
  const speed = parseFloat(speedSlider.value);
  player.playbackRate = speed;
  speedLabel.textContent = `速度: ${speed.toFixed(1)}x`;
});

// ミュートボタン
muteBtn.addEventListener("click", () => {
  player.muted = !player.muted;
  muteBtn.textContent = player.muted ? "🔇 ミュート解除" : "🔈 ミュート";
});

// 🎵 リクエスト処理
const requestButton = document.getElementById("requestButton");
const floatingRequest = document.getElementById("floatingRequest");
const requestForm = document.getElementById("requestForm");
const requestTitle = document.getElementById("requestTitle");
const requestList = document.getElementById("requestList");

requestButton.addEventListener("click", (e) => {
  e.preventDefault();
  floatingRequest.classList.remove("hidden");
  setTimeout(() => floatingRequest.classList.add("show"), 10);
});

document.addEventListener("click", (e) => {
  if (floatingRequest.classList.contains("show") && !floatingRequest.contains(e.target) && e.target !== requestButton) {
    floatingRequest.classList.remove("show");
    setTimeout(() => floatingRequest.classList.add("hidden"), 500);
  }
});

requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = requestTitle.value.trim();
  if (!title) return;
  await fetch("/api/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  requestTitle.value = "";
  loadRequests();
});

async function loadRequests() {
  const res = await fetch("/api/requests");
  const data = await res.json();
  requestList.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.title;
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = async () => {
      const key = prompt("削除キーを入力してください（管理者専用）:");
      if (!key) return;
      await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, key }),
      });
      loadRequests();
    };
    li.appendChild(delBtn);
    requestList.appendChild(li);
  });
}

let scrollTitleInterval;
let titleBase = "🎵 Now Playing: ";
let currentTitleScroll = "";
let scrollIndex = 0;

function startTitleScroll(trackTitle) {
  titleBase = `🎵 Now Playing: ${trackTitle} — `;
  currentTitleScroll = titleBase + " ";
  scrollIndex = 0;
  if (scrollTitleInterval) clearInterval(scrollTitleInterval);
  scrollTitleInterval = setInterval(() => {
    document.title = currentTitleScroll.substring(scrollIndex) + currentTitleScroll.substring(0, scrollIndex);
    scrollIndex = (scrollIndex + 1) % currentTitleScroll.length;
  }, 100);
}

function updateScrollingTitle(trackTitle) {
  const el = document.getElementById("scrollingTitle");
  if (el) el.textContent = `🎵 Now Playing: ${trackTitle} — `.repeat(3);
}

// 初期化
createTrackList();
loadTrack(0);
