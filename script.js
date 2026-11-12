// ========================================
// 1. 技の名前と、ゲームで使う変数
// ========================================

// 配列は左から 0、1、2 番。
const moveNames = ["速いジャブ", "ボディー", "顔ガード"];
const playerPoses = ["punch-jab", "punch-body", "block"];
const opponentPoses = ["jab", "body", "block"];
const winMessages = [
  "速いジャブが、ボディーより先に決まった！",
  "ボディーが、顔ガードの下に決まった！",
  "顔ガードでジャブを防いで反撃！"
];

let playerHp = 5;
let opponentHp = 5;
let turn = 1;
let scene = "ready"; // ready：開始前、choose：選択中、result：結果、finished：終了
let computerMove = 0;

// 相手のよく使う技と、それ以外の２つの技。
// 技番号は 0：速いジャブ、1：ボディー、2：顔ガード。
let mainMove = 2;
let otherMove1 = 0;
let otherMove2 = 1;

// パンチの効果音。音声ファイルもアプリの中に入っています。
const punchSound = new Audio("sounds/punch.wav");
punchSound.volume = 0.6; // 0なら無音、1なら最大音量。

function playPunchSound() {
  punchSound.currentTime = 0; // 前の音が鳴っていても、最初に戻す。
  punchSound.play().catch(function () {
    // 音を再生できない場合も、ゲームは続ける。
    console.warn("パンチ音を再生できませんでした。");
  });
}

// ========================================
// 2. じゃんけんと同じ考え方で、勝ち・負け・アイコを判定する
// ========================================

function judge(player, computer) {
  // 同じ技ならアイコ。
  if (player === computer) {
    return "draw";
  } else if (player === 0 && computer === 1) {
    // 速いジャブ（0）は、ボディー（1）に勝つ。
    return "win";
  } else if (player === 1 && computer === 2) {
    // ボディー（1）は、顔ガード（2）に勝つ。
    return "win";
  } else if (player === 2 && computer === 0) {
    // 顔ガード（2）は、速いジャブ（0）に勝つ。
    return "win";
  } else {
    // アイコでも勝ちでもなければ、負け。
    return "lose";
  }
}

// ========================================
// 3. HPとターン番号を、画面に反映する
// ========================================

function showHp() {
  document.querySelector("#player-hp").textContent = playerHp;
  document.querySelector("#opponent-hp").textContent = opponentHp;
  document.querySelector("#player-hp-bar").value = playerHp;
  document.querySelector("#opponent-hp-bar").value = opponentHp;
  document.querySelector("#turn").textContent = turn;
}

// ========================================
// 4. 相手の技を先に決めて、自分が選ぶボタンを表示する
// ========================================

function prepareTurn() {
  // Math.random() は 0以上1未満の数。10倍して切り捨てると 0〜9 の整数になる。
  // この数字は抽選用。技番号の 0・1・2 とは別の数字です。
  const random = Math.floor(Math.random() * 10);

  if (random < 6) {
    // 0・1・2・3・4・5 のとき → 60%でよく使う技。
    computerMove = mainMove;
  } else if (random < 8) {
    // 6・7 のとき → 20%で別の技。
    computerMove = otherMove1;
  } else {
    // 8・9 のとき → 20%でもう１つの技。
    computerMove = otherMove2;
  }
  scene = "choose";
  document.querySelector("#boxer").className = "boxer idle";
  document.querySelector("#hands").className = "hands";
  document.querySelector("#effect").textContent = "";
  document.querySelector("#next").style.display = "none";
  document.querySelector("#move-buttons").style.display = "grid";
  document.querySelector("#turn-label").textContent = "CHOOSE YOUR MOVE";
  document.querySelector("#instruction").textContent = "速さ・ボディー・ガード。どれで勝負？";
  document.querySelector("#moves").textContent = "あなた：— ／ 相手：—";
  document.querySelector("#result").textContent = "相手のクセをヒントに、１つ選んでください。";
  showHp();
}

// ========================================
// 5. 技を選ぶ → 勝敗判定 → HP変更 → 結果表示
// ========================================

function play(number) {
  // 結果表示中や試合終了後の連打を防ぐ。
  if (scene !== "choose") {
    return;
  }
  scene = "result";
  const outcome = judge(number, computerMove);
  document.querySelector("#move-buttons").style.display = "none";
  document.querySelector("#moves").textContent = "あなた：" + moveNames[number] + " ／ 相手：" + moveNames[computerMove];
  document.querySelector("#hands").className = "hands " + playerPoses[number];
  document.querySelector("#boxer").className = "boxer " + opponentPoses[computerMove];

  if (outcome === "win") {
    opponentHp = opponentHp - 1;
    playPunchSound();
    document.querySelector("#turn-label").textContent = "YOU WIN THIS TURN";
    document.querySelector("#instruction").textContent = "読み勝ち！ あなたの勝ち。";
    document.querySelector("#result").textContent = winMessages[number] + " 相手に１ダメージ。";
    document.querySelector("#boxer").className = "boxer hit";
    document.querySelector("#effect").textContent = "YOU WIN!";
  } else if (outcome === "lose") {
    playerHp = playerHp - 1;
    playPunchSound();
    document.querySelector("#turn-label").textContent = "OPPONENT WINS THIS TURN";
    document.querySelector("#instruction").textContent = "読まれた… 相手の勝ち。";
    document.querySelector("#result").textContent = winMessages[computerMove] + " あなたに１ダメージ。";
    document.querySelector("#effect").textContent = "YOU LOSE";
  } else {
    document.querySelector("#turn-label").textContent = "DRAW / TRY AGAIN";
    document.querySelector("#instruction").textContent = "同じ技！ アイコ。";
    document.querySelector("#result").textContent = "お互いのHPはそのまま。次の一手を考えよう。";
    document.querySelector("#effect").textContent = "DRAW!";
  }
  showHp();
  checkFinish();
}

// ========================================
// 6. HPが０ならKO。それ以外は「次の勝負へ」を表示する
// ========================================

function checkFinish() {
  if (opponentHp === 0 || playerHp === 0) {
    scene = "finished";
    document.querySelector("#turn-label").textContent = "MATCH FINISHED";
    document.querySelector("#opponent-select").disabled = false;
    document.querySelector("#start").style.display = "block";
    document.querySelector("#start").textContent = "もう一度遊ぶ →";
    document.querySelector("#effect").textContent = "KO!";
    if (opponentHp === 0) {
      document.querySelector("#instruction").textContent = "KO！ あなたの勝利！";
      document.querySelector("#boxer").className = "boxer ko";
    } else {
      document.querySelector("#instruction").textContent = "KO… 相手の勝利。もう一度挑戦！";
    }
  } else {
    document.querySelector("#next").style.display = "block";
  }
}

// ========================================
// 7. 試合開始・次の勝負・最初に戻す
// ========================================

function startGame() {
  playerHp = 5;
  opponentHp = 5;
  turn = 1;
  document.querySelector("#start").style.display = "none";
  document.querySelector("#opponent-select").disabled = true;
  prepareTurn();
}

function nextTurn() {
  if (scene !== "result") {
    return;
  }
  turn = turn + 1;
  prepareTurn();
}

function resetGame() {
  playerHp = 5;
  opponentHp = 5;
  turn = 1;
  scene = "ready";
  showHp();
  document.querySelector("#move-buttons").style.display = "none";
  document.querySelector("#next").style.display = "none";
  document.querySelector("#start").style.display = "block";
  document.querySelector("#start").textContent = "試合をはじめる →";
  document.querySelector("#opponent-select").disabled = false;
  document.querySelector("#turn-label").textContent = "LET'S GET READY";
  document.querySelector("#instruction").textContent = "相手のクセを見て、試合をはじめよう。";
  document.querySelector("#moves").textContent = "あなた：— ／ 相手：—";
  document.querySelector("#result").textContent = "勝つと相手に１ダメージ。お互いのHPは５です。";
  document.querySelector("#boxer").className = "boxer idle";
  document.querySelector("#hands").className = "hands";
  document.querySelector("#effect").textContent = "";
}

// ========================================
// 8. 相手ごとのクセ。60%で選ぶ技と、残りの２つの技を決める
// ========================================

function changeOpponent() {
  const name = document.querySelector("#opponent-select").value;
  if (name === "ren") {
    mainMove = 2;
    otherMove1 = 0;
    otherMove2 = 1;
    document.querySelector("#opponent-hint").textContent = "クセ：顔ガードが多い（60%）。ボディーが狙い目。";
  } else if (name === "shin") {
    mainMove = 1;
    otherMove1 = 0;
    otherMove2 = 2;
    document.querySelector("#opponent-hint").textContent = "クセ：ボディーが多い（60%）。速いジャブが狙い目。";
  } else {
    mainMove = 0;
    otherMove1 = 1;
    otherMove2 = 2;
    document.querySelector("#opponent-hint").textContent = "クセ：速いジャブが多い（60%）。顔ガードで防いで反撃。";
  }
  resetGame();
}

// ========================================
// 9. ボタンを押したら、対応する関数を動かす
// ========================================

document.querySelector("#jab").addEventListener("click", function () {
  play(0);
});
document.querySelector("#body").addEventListener("click", function () {
  play(1);
});
document.querySelector("#guard").addEventListener("click", function () {
  play(2);
});
document.querySelector("#start").addEventListener("click", startGame);
document.querySelector("#next").addEventListener("click", nextTurn);
document.querySelector("#reset").addEventListener("click", resetGame);
document.querySelector("#opponent-select").addEventListener("change", changeOpponent);

// ページを開いたときに、最初の相手と画面を用意する。
changeOpponent();
