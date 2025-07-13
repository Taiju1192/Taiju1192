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
typingWrapper.style.display = "none";
typingWrapper.style.padding = "1rem";
typingWrapper.style.margin = "1rem";
typingWrapper.style.border = "1px solid #ccc";
typingWrapper.style.borderRadius = "8px";
typingWrapper.style.background = "#fdf6e3";
document.body.appendChild(typingWrapper);

const typingDisplay = typingWrapper.querySelector("#typingDisplay");
const typingInput = typingWrapper.querySelector("#typingInput");
const exitTyping = typingWrapper.querySelector("#exitTyping");

const keySounds = [
  new Audio("https://soundeffect-lab.info/sound/machine/mp3/keyboard1.mp3"),
  new Audio("https://soundeffect-lab.info/sound/machine/mp3/keyboard2.mp3"),
];

const typingQuestions = [
  "鉛筆を使用する",
  "自転車に乗る",
  "プログラミングを学ぶ",
  "こんにちは世界",
  "小さいゃゅょの練習",
  "ファイルをダウンロード",
  "テストの準備をする"
];

let currentTypingKana = "";
let currentTypingRoman = "";

// ひらがな → ローマ字変換（超簡易バージョン。応用可能）
function kanaToRomaji(kana) {
  const table = {
    あ: "a", い: "i", う: "u", え: "e", お: "o",
    か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
    さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
    た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
    な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
    は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
    ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
    や: "ya", ゆ: "yu", よ: "yo",
    ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
    わ: "wa", を: "wo", ん: "n",
    が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
    ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
    だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
    ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
    ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
    きゃ: "kya", きゅ: "kyu", きょ: "kyo",
    しゃ: "sha", しゅ: "shu", しょ: "sho",
    ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
    にゃ: "nya", にゅ: "nyu", にょ: "nyo",
    ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
    みゃ: "mya", みゅ: "myu", みょ: "myo",
    りゃ: "rya", りゅ: "ryu", りょ: "ryo",
    ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
    じゃ: "ja", じゅ: "ju", じょ: "jo",
    ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
    っ: "",　ー: "-", // 拗音と促音など（っはスキップで処理）
  };

  let romaji = "";
  for (let i = 0; i < kana.length; i++) {
    let two = kana[i] + kana[i + 1];
    if (table[two]) {
      romaji += table[two];
      i++;
    } else if (kana[i] === "っ" && kana[i + 1]) {
      const next = kana[i + 1];
      let nextRoma = table[next] || "";
      romaji += nextRoma[0]; // 促音処理（次の子音を重ねる）
    } else {
      romaji += table[kana[i]] || "";
    }
  }
  return romaji;
}

function nextTypingQuestion() {
  const index = Math.floor(Math.random() * typingQuestions.length);
  currentTypingKana = typingQuestions[index];
  currentTypingRoman = kanaToRomaji(currentTypingKana);
  typingDisplay.innerHTML = `<strong>${currentTypingKana}</strong>`;
  typingInput.value = "";
}

typingInput.addEventListener("input", () => {
  const typed = typingInput.value;
  if (currentTypingRoman.startsWith(typed)) {
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

window.startTypingMode = function () {
  nextTypingQuestion();
  typingWrapper.style.display = "block";
  typingInput.focus();
};
