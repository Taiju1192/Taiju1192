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
let nextTrack = 1; // 次に流す曲を事前に確定
let playMode = "sequential"; // "sequential" or "random"
let repeatOne = false;
let shuffledPlaylist = [];
let recentlyPlayed = [];

const RECENT_HISTORY_SIZE = 10;

function createShuffledPlaylist() {
  shuffledPlaylist = [...Array(tracks.length).keys()];
  for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
  }
}

function getRandomTrackWithHistory() {
  if (recentlyPlayed.length >= tracks.length) {
    recentlyPlayed = [];
  }
  const availableTracks = tracks.map((_, i) => i).filter(i => !recentlyPlayed.includes(i));
  if (availableTracks.length === 0) {
    recentlyPlayed.shift();
    return getRandomTrackWithHistory();
  }
  const randomIndex = Math.floor(Math.random() * availableTracks.length);
  return availableTracks[randomIndex];
}

function addToRecentlyPlayed(index) {
  const existingIndex = recentlyPlayed.indexOf(index);
  if (existingIndex > -1) {
    recentlyPlayed.splice(existingIndex, 1);
  }
  recentlyPlayed.unshift(index);
  if (recentlyPlayed.length > RECENT_HISTORY_SIZE) {
    recentlyPlayed = recentlyPlayed.slice(0, RECENT_HISTORY_SIZE);
  }
}

function determineNextTrack() {
  if (repeatOne) {
    nextTrack = currentTrack;
    return;
  }
  
  if (playMode === "random") {
    nextTrack = getRandomTrackWithHistory();
  } else {
    nextTrack = (currentTrack + 1) % tracks.length;
  }
}

function updateNowNextDisplay() {
  nowPlayingEl.textContent = tracks[currentTrack].title || "---";
  nextTrackEl.textContent = tracks[nextTrack]?.title || "---";
}

function loadTrack(index) {
  currentTrack = index;
  player.src = tracks[index].src;
  player.play();
  highlightCurrentTrack();
  addToRecentlyPlayed(index);
  
  // 次の曲を確定してから表示を更新
  determineNextTrack();
  updateNowNextDisplay();
  
// ✅ スクロールする再生中タイトルの更新
updateScrollingTitle(tracks[index].title);
startTitleScroll(tracks[index].title); // ✅ タブタイトルもスクロール

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: tracks[index].title,
      artist: "曲追加リクエストはこちらへ DISCORD_ID：taiju_5662",
      album: "プレイリスト",
      artwork: [{ src: "https://cdn.glitch.global/1a7b0d9f-053a-4c34-817e-4c9c9da5b28a/disc_music_15034-300x300.png?v=1750483913156", sizes: "300x300", type: "image/png" }]
    });
  }
}

function highlightCurrentTrack() {
  const lis = tracklist.querySelectorAll("li");
  lis.forEach((li, i) => {
    li.style.fontWeight = i === currentTrack ? "bold" : "normal";
  });
}

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

function updatePlayModeButton() {
  playModeBtn.textContent = playMode === "sequential" ? "🔁 順番再生" : "🔀 ランダム再生";
  playModeBtn.classList.toggle("random-mode", playMode === "random");
}

function playRandomTrack() {
  const index = getRandomTrackWithHistory();
  loadTrack(index);
}

repeatOneBtn.addEventListener("click", () => {
  repeatOne = !repeatOne;
  repeatOneBtn.textContent = repeatOne ? "🔂 リピート中" : "🔂 リピート1曲";
  
  // リピート設定変更時に次の曲を再確定
  determineNextTrack();
  updateNowNextDisplay();
  
  alert(repeatOne ? "リピートモードON" : "リピートモードOFF");
});

player.addEventListener("ended", () => {
  if (repeatOne) {
    player.currentTime = 0;
    player.play();
    return;
  }
  // 事前に確定していた次の曲を再生
  loadTrack(nextTrack);
});

seek.addEventListener("input", () => {
  if (player.duration) {
    player.currentTime = (seek.value / 100) * player.duration;
  }
});

player.addEventListener("timeupdate", () => {
  if (player.duration) {
    seek.value = (player.currentTime / player.duration) * 100;
  }
});

skipBtn.addEventListener("click", () => {
  // 事前に確定していた次の曲を再生
  loadTrack(nextTrack);
});

shuffleBtn.addEventListener("click", () => {
  playMode = "random";
  recentlyPlayed = [];
  updatePlayModeButton();
  playRandomTrack();
  alert("シャッフル再生を開始しました！");
});

playModeBtn.addEventListener("click", () => {
  playMode = playMode === "sequential" ? "random" : "sequential";
  recentlyPlayed = [];
  
  // 再生モード変更時に次の曲を再確定
  determineNextTrack();
  updateNowNextDisplay();
  updatePlayModeButton();
  
  alert(playMode === "random" ? "ランダム再生モードに切り替えました！" : "順番再生モードに切り替えました！");
});

search.addEventListener("input", () => {
  const value = search.value.toLowerCase();
  const filtered = tracks.filter(t => t.title.toLowerCase().includes(value));
  tracklist.innerHTML = "";
  filtered.forEach((track) => {
    const li = document.createElement("li");
    const titleSpan = document.createElement("span");
    titleSpan.textContent = track.title;
    titleSpan.style.cursor = "pointer";
    titleSpan.onclick = () => loadTrack(tracks.indexOf(track));

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

// 🎧 設定パネル制御
const settingsButton = document.getElementById("settingsButton");
const floatingSettings = document.getElementById("floatingSettings");
settingsButton.addEventListener("click", (e) => {
  e.preventDefault();
  floatingSettings.classList.remove("hidden");
  setTimeout(() => floatingSettings.classList.add("show"), 10);
});
document.addEventListener("click", (e) => {
  if (
    floatingSettings.classList.contains("show") &&
    !floatingSettings.contains(e.target) &&
    e.target !== settingsButton
  ) {
    floatingSettings.classList.remove("show");
    setTimeout(() => floatingSettings.classList.add("hidden"), 500);
  }
});

// 🎚 音量・速度・ミュート
volumeSlider.addEventListener("input", () => {
  player.volume = parseFloat(volumeSlider.value);
});
speedSlider.addEventListener("input", () => {
  const speed = parseFloat(speedSlider.value);
  player.playbackRate = speed;
  speedLabel.textContent = `速度: ${speed.toFixed(1)}x`;
});
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
  if (
    floatingRequest.classList.contains("show") &&
    !floatingRequest.contains(e.target) &&
    e.target !== requestButton
  ) {
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

async function updateClockFromAPI() {
  try {
    const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Tokyo");
    const data = await res.json();

    const date = new Date(data.datetime); // ← 正しい日本時間のDateオブジェクト

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const timeString = `🕒 ${year}年${month}月${day}日 ${hours}時${minutes}分${seconds}秒`;

    const clockElement = document.getElementById("clock");
    if (clockElement && clockElement.textContent !== timeString) {
      clockElement.textContent = timeString;
    }
  } catch (e) {
    console.error("日本時刻の取得に失敗しました:", e);
  }
}


setInterval(updateClockFromAPI, 1000);
updateClockFromAPI();


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
    document.title =
      currentTitleScroll.substring(scrollIndex) + currentTitleScroll.substring(0, scrollIndex);
    scrollIndex = (scrollIndex + 1) % currentTitleScroll.length;
  }, 100); // スクロール速度（ミリ秒）
}

function updateScrollingTitle(trackTitle) {
  const el = document.getElementById("scrollingTitle");
  if (el) {
    el.textContent = `🎵 Now Playing: ${trackTitle} — `.repeat(3); // ループ感を出す
  }
}


// 初期化
createTrackList();
playMode = "random";
updatePlayModeButton();
playRandomTrack();
// 初期化時も次の曲を確定
determineNextTrack();
updateNowNextDisplay();
loadRequests();
