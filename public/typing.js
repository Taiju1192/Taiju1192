// typing.js - タイピング機能専用

const typingWrapper = document.createElement("div");
typingWrapper.id = "typingWrapper";
typingWrapper.innerHTML = `
  <h2>💻 タイピングモード</h2>
  <div id="typingDisplay" style="font-size: 1.5rem; margin: 1rem 0;"></div>
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

let typingQuestions = [];
let currentTypingKana = "";
let currentTypingRomanList = [];

function kanaToRomajiVariants(kana) {
  const table = {
    あ: ["a"], い: ["i"], う: ["u"], え: ["e"], お: ["o"],
    か: ["ka"], き: ["ki"], く: ["ku"], け: ["ke"], こ: ["ko"],
    さ: ["sa"], し: ["shi", "si"], す: ["su"], せ: ["se"], そ: ["so"],
    た: ["ta"], ち: ["chi", "ti"], つ: ["tsu", "tu"], て: ["te"], と: ["to"],
    な: ["na"], に: ["ni"], ぬ: ["nu"], ね: ["ne"], の: ["no"],
    は: ["ha"], ひ: ["hi"], ふ: ["fu", "hu"], へ: ["he"], ほ: ["ho"],
    ま: ["ma"], み: ["mi"], む: ["mu"], め: ["me"], も: ["mo"],
    や: ["ya"], ゆ: ["yu"], よ: ["yo"],
    ら: ["ra"], り: ["ri"], る: ["ru"], れ: ["re"], ろ: ["ro"],
    わ: ["wa"], を: ["wo"], ん: ["n"],
    が: ["ga"], ぎ: ["gi"], ぐ: ["gu"], げ: ["ge"], ご: ["go"],
    ざ: ["za"], じ: ["ji", "zi"], ず: ["zu"], ぜ: ["ze"], ぞ: ["zo"],
    だ: ["da"], ぢ: ["ji", "di"], づ: ["zu", "du"], で: ["de"], ど: ["do"],
    ば: ["ba"], び: ["bi"], ぶ: ["bu"], べ: ["be"], ぼ: ["bo"],
    ぱ: ["pa"], ぴ: ["pi"], ぷ: ["pu"], ぺ: ["pe"], ぽ: ["po"],
    きゃ: ["kya"], きゅ: ["kyu"], きょ: ["kyo"],
    しゃ: ["sha", "sya"], しゅ: ["shu", "syu"], しょ: ["sho", "syo"],
    ちゃ: ["cha", "tya"], ちゅ: ["chu", "tyu"], ちょ: ["cho", "tyo"],
    にゃ: ["nya"], にゅ: ["nyu"], にょ: ["nyo"],
    ひゃ: ["hya"], ひゅ: ["hyu"], ひょ: ["hyo"],
    みゃ: ["mya"], みゅ: ["myu"], みょ: ["myo"],
    りゃ: ["rya"], りゅ: ["ryu"], りょ: ["ryo"],
    ぎゃ: ["gya"], ぎゅ: ["gyu"], ぎょ: ["gyo"],
    じゃ: ["ja", "zya", "jya"], じゅ: ["ju", "zyu", "jyu"], じょ: ["jo", "zyo", "jyo"],
    ぴゃ: ["pya"], ぴゅ: ["pyu"], ぴょ: ["pyo"],
    っ: ["ltu", "xtu"],
    ー: ["-"],
  };

  function combineRomaji(kanaStr) {
    const results = [""];
    for (let i = 0; i < kanaStr.length; i++) {
      let matched = false;
      if (i + 1 < kanaStr.length) {
        const twoKana = kanaStr[i] + kanaStr[i + 1];
        if (table[twoKana]) {
          const romas = table[twoKana];
          const newResults = [];
          for (const base of results) {
            for (const roma of romas) newResults.push(base + roma);
          }
          results.splice(0, results.length, ...newResults);
          i++;
          matched = true;
        }
      }
      if (!matched) {
        const char = kanaStr[i];
        if (char === "っ" && kanaStr[i + 1]) {
          const nextChar = kanaStr[i + 1];
          let nextRomaSet = [];
          if (i + 2 < kanaStr.length) {
            const two = kanaStr[i + 1] + kanaStr[i + 2];
            if (table[two]) nextRomaSet = table[two];
          }
          if (!nextRomaSet.length && table[nextChar]) nextRomaSet = table[nextChar];
          const doubled = nextRomaSet.map(r => r[0] + r);
          const newResults = [];
          for (const base of results) {
            for (const r of doubled.concat(["ltu", "xtu"])) newResults.push(base + r);
          }
          results.splice(0, results.length, ...newResults);
        } else if (table[char]) {
          const romas = table[char];
          const newResults = [];
          for (const base of results) {
            for (const roma of romas) newResults.push(base + roma);
          }
          results.splice(0, results.length, ...newResults);
        } else {
          results.forEach((r, idx) => results[idx] = r + char);
        }
      }
    }
    return results;
  }
  return combineRomaji(kana);
}

function nextTypingQuestion() {
  if (typingQuestions.length === 0) {
    typingDisplay.innerHTML = "お題が見つかりません。";
    return;
  }
  const index = Math.floor(Math.random() * typingQuestions.length);
  currentTypingKana = typingQuestions[index];
  currentTypingRomanList = kanaToRomajiVariants(currentTypingKana);
  typingDisplay.innerHTML = `<strong>${currentTypingKana}</strong>`;
  typingInput.value = "";
}

typingInput.addEventListener("input", () => {
  const typed = typingInput.value;
  if (currentTypingRomanList.some(r => r.startsWith(typed))) {
    const sound = keySounds[Math.floor(Math.random() * keySounds.length)];
    sound.currentTime = 0;
    sound.play();
  }
  if (currentTypingRomanList.includes(typed)) {
    nextTypingQuestion();
  }
});

exitTyping.addEventListener("click", () => {
  typingWrapper.style.display = "none";
});

window.startTypingMode = function () {
  const script = document.createElement("script");
  script.src = "/typing_word.js";
  script.onload = () => {
    if (Array.isArray(window.typingWords)) {
      typingQuestions = window.typingWords;
      nextTypingQuestion();
      typingWrapper.style.display = "block";
      typingInput.focus();
    } else {
      typingDisplay.innerHTML = "typing_word.js に有効な単語がありません。";
      typingWrapper.style.display = "block";
    }
  };
  script.onerror = () => {
    typingDisplay.innerHTML = "typing_word.js の読み込みに失敗しました。";
    typingWrapper.style.display = "block";
  };
  document.body.appendChild(script);
};
