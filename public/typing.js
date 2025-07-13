// typing.js - タイピング機能専用

const typingWrapper = document.createElement("div");
typingWrapper.id = "typingWrapper";
typingWrapper.innerHTML = `
  <h2>💻 タイピングモード</h2>
  <div id="typingDisplay"></div>
  <input type="text" id="typingInput" autocomplete="off" placeholder="ここにタイピング" autofocus />
  <br><br>
  <button id="exitTyping">終了</button>
`;
document.body.appendChild(typingWrapper);

typingWrapper.style.display = "none";

const typingDisplay = document.getElementById("typingDisplay");
const typingInput = document.getElementById("typingInput");
const exitTyping = document.getElementById("exitTyping");

const keySounds = [
  new Audio("https://soundeffect-lab.info/sound/machine/mp3/keyboard1.mp3"),
  new Audio("https://soundeffect-lab.info/sound/machine/mp3/keyboard2.mp3"),
];

let typingQuestions = [];
let currentTypingKana = "";
let currentTypingRoman = "";

// ローマ字変換ライブラリ（TinySegmenterやmoji等の代用）を自作（簡易版）
function kanaToRomaji(kana) {
  const table = {
    あ: "a",  い: "i",  う: "u",  え: "e",  お: "o",
    か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
    さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
    た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
    な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
    は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
    ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
    や: "ya",            ゆ: "yu",            よ: "yo",
    ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
    わ: "wa", を: "wo", ん: "n",
    が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
    ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
    だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
    ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
    ぱ: "pa", ぴ: "pi", ぷ: "pu", べ: "pe", ぽ: "po",
    ゃ: "xya", ゅ: "xyu", ょ: "xyo", っ: "xtsu"
  };
  let result = "";
  for (let i = 0; i < kana.length; i++) {
    const c = kana[i];
    result += table[c] || "";
  }
  return result;
}

function nextTypingQuestion() {
  const randomIndex = Math.floor(Math.random() * typingQuestions.length);
  currentTypingKana = typingQuestions[randomIndex];
  currentTypingRoman = kanaToRomaji(currentTypingKana);
  typingDisplay.innerHTML = `<strong>${currentTypingKana}</strong>`;
  typingInput.value = "";
}

typingInput.addEventListener("input", () => {
  const typed = typingInput.value;
  if (currentTypingRoman.startsWith(typed)) {
    // 正しいキーが入力された場合に効果音を鳴らす
    const sound = keySounds[Math.floor(Math.random() * keySounds.length)];
    sound.currentTime = 0;
    sound.play();
  }

  if (typed === currentTypingRoman) {
    nextTypingQuestion();
  }
});

exitTyping.addEventListener("click", () => {
  typingWrapper.style.display = "none";
});

function startTypingMode() {
  fetch("typing.js")
    .then(res => res.text())
    .then(() => {
      typingQuestions = ["あいう", "えお", "かきくけこ", "しゃしゅしょ", "っぱっぴ"];
      nextTypingQuestion();
      typingWrapper.style.display = "block";
      typingInput.focus();
    });
}
