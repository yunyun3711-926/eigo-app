// localStorage に保存するときのキー
const STORAGE_KEY = "eigo-app-progress";

// 画面の要素
const screens = {
  home: document.getElementById("home-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen")
};
const stageList = document.getElementById("stage-list");
const quizStageName = document.getElementById("quiz-stage-name");
const quizProgressText = document.getElementById("quiz-progress-text");
const progressFill = document.getElementById("progress-fill");
const questionText = document.getElementById("question-text");
const choiceList = document.getElementById("choice-list");
const feedback = document.getElementById("feedback");
const feedbackResult = document.getElementById("feedback-result");
const answerEn = document.getElementById("answer-en");
const answerKana = document.getElementById("answer-kana");
const speakButton = document.getElementById("speak-button");
const feedbackExplanation = document.getElementById("feedback-explanation");
const nextButton = document.getElementById("next-button");
const resultIcon = document.getElementById("result-icon");
const resultTitle = document.getElementById("result-title");
const resultScore = document.getElementById("result-score");
const resultMessage = document.getElementById("result-message");
const nextStageButton = document.getElementById("next-stage-button");

// 発音機能（ブラウザが対応している場合のみ使う）
const canSpeak = "speechSynthesis" in window;

// クイズ中の状態
let currentStageIndex = 0;
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;

// 学習記録
// unlocked: 解放済みのステージ数 / bestScores: ステージごとの最高点
let progress = loadProgress();

function loadProgress() {
  const initial = { unlocked: 1, bestScores: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.unlocked === "number") {
      return { unlocked: saved.unlocked, bestScores: saved.bestScores || {} };
    }
  } catch (error) {
    // 保存データが読めないときは最初から始める
  }
  return initial;
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    // 保存できない環境（プライベートモードなど）でもアプリは動かす
  }
}

// 配列をシャッフルした新しい配列を返す
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.hidden = key !== name;
  });
  window.scrollTo(0, 0);
}

// ステージ選択画面
function renderHome() {
  stageList.replaceChildren();

  STAGES.forEach((stage, index) => {
    const isLocked = index >= progress.unlocked;
    const best = progress.bestScores[stage.id];
    const isCleared = best === stage.questions.length;

    const item = document.createElement("li");
    const card = document.createElement("button");
    card.type = "button";
    card.className = "stage-card";
    card.disabled = isLocked;
    if (isCleared) {
      card.classList.add("is-cleared");
    }

    const icon = document.createElement("span");
    icon.className = "stage-icon";
    icon.textContent = isLocked ? "🔒" : stage.icon;

    const body = document.createElement("span");
    body.className = "stage-body";
    const level = document.createElement("span");
    level.className = "stage-level";
    level.textContent = `LEVEL ${index + 1}`;
    const name = document.createElement("span");
    name.className = "stage-name";
    name.textContent = stage.title;
    const desc = document.createElement("span");
    desc.className = "stage-desc";
    desc.textContent = isLocked
      ? `「${STAGES[index - 1].title}」を全問正解で解放`
      : stage.description;
    body.append(level, name, desc);

    const status = document.createElement("span");
    status.className = "stage-status";
    if (isCleared) {
      status.textContent = "★ クリア";
    } else if (best !== undefined) {
      status.textContent = `最高 ${best}/${stage.questions.length}`;
    }

    card.append(icon, body, status);
    card.addEventListener("click", () => startStage(index));
    item.append(card);
    stageList.append(item);
  });

  showScreen("home");
}

// クイズ
function startStage(stageIndex) {
  currentStageIndex = stageIndex;
  currentQuestions = shuffle(STAGES[stageIndex].questions);
  currentQuestionIndex = 0;
  correctCount = 0;
  quizStageName.textContent = `LEVEL ${stageIndex + 1}　${STAGES[stageIndex].title}`;
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const question = currentQuestions[currentQuestionIndex];
  const total = currentQuestions.length;

  quizProgressText.textContent = `${currentQuestionIndex + 1} / ${total}問`;
  progressFill.style.width = `${(currentQuestionIndex / total) * 100}%`;
  questionText.textContent = question.ja;
  feedback.hidden = true;

  // choices の先頭が正解なので、印をつけてからシャッフルする
  const choices = shuffle(
    question.choices.map((choice, index) => ({ ...choice, isCorrect: index === 0 }))
  );

  choiceList.replaceChildren();
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";

    const en = document.createElement("span");
    en.className = "choice-en";
    en.textContent = choice.en;

    // カタカナは回答後に表示する
    const kana = document.createElement("span");
    kana.className = "choice-kana";
    kana.textContent = choice.kana;
    kana.hidden = true;

    button.append(en, kana);
    button.dataset.correct = choice.isCorrect ? "true" : "false";
    button.addEventListener("click", () => handleAnswer(button, question));
    choiceList.append(button);
  });
}

function handleAnswer(selectedButton, question) {
  const isCorrect = selectedButton.dataset.correct === "true";
  if (isCorrect) {
    correctCount++;
  }

  // 全選択肢にカタカナを出し、正解・不正解の色をつける
  choiceList.querySelectorAll(".choice-button").forEach((button) => {
    button.disabled = true;
    button.querySelector(".choice-kana").hidden = false;
    if (button.dataset.correct === "true") {
      button.classList.add("is-correct");
    } else if (button === selectedButton) {
      button.classList.add("is-wrong");
    } else {
      button.classList.add("is-dimmed");
    }
  });

  const answer = question.choices[0];
  feedbackResult.textContent = isCorrect ? "⭕ 正解！" : "❌ 不正解…";
  feedbackResult.className = `feedback-result ${isCorrect ? "is-correct" : "is-wrong"}`;
  answerEn.textContent = answer.en;
  answerKana.textContent = answer.kana;
  speakButton.hidden = !canSpeak;
  feedbackExplanation.textContent = question.explanation;

  const isLast = currentQuestionIndex === currentQuestions.length - 1;
  nextButton.textContent = isLast ? "結果を見る" : "次の問題へ";
  feedback.hidden = false;
  feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function speak(text) {
  if (!canSpeak) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function goToNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuestions.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

// 結果画面
function showResult() {
  const stage = STAGES[currentStageIndex];
  const total = currentQuestions.length;
  const isPerfect = correctCount === total;
  const hasNextStage = currentStageIndex < STAGES.length - 1;

  // 最高点を更新
  const best = progress.bestScores[stage.id];
  if (best === undefined || correctCount > best) {
    progress.bestScores[stage.id] = correctCount;
  }

  // 全問正解なら次のステージを解放
  let leveledUp = false;
  if (isPerfect && hasNextStage && progress.unlocked <= currentStageIndex + 1) {
    progress.unlocked = currentStageIndex + 2;
    leveledUp = true;
  }
  saveProgress();

  resultScore.textContent = `${correctCount} / ${total}`;
  nextStageButton.hidden = !(isPerfect && hasNextStage);

  if (isPerfect && !hasNextStage) {
    resultIcon.textContent = "🏆";
    resultTitle.textContent = "全ステージクリア！";
    resultMessage.textContent = "おめでとうございます！接客英語はばっちりです。実際の接客でもぜひ使ってみてください。";
  } else if (isPerfect) {
    resultIcon.textContent = "🎉";
    resultTitle.textContent = leveledUp ? "レベルアップ！" : "全問正解！";
    resultMessage.textContent = `次は「${STAGES[currentStageIndex + 1].title}」に挑戦しましょう。`;
  } else {
    resultIcon.textContent = correctCount >= total * 0.7 ? "👍" : "📖";
    resultTitle.textContent = "おつかれさまでした";
    resultMessage.textContent = hasNextStage
      ? `あと${total - correctCount}問！全問正解で次のステージに進めます。`
      : `あと${total - correctCount}問で全問正解です。もう一度挑戦してみましょう。`;
  }

  showScreen("result");
}

// ボタンのイベント
speakButton.addEventListener("click", () => speak(answerEn.textContent));
nextButton.addEventListener("click", goToNextQuestion);
document.getElementById("quit-button").addEventListener("click", renderHome);
document.getElementById("retry-button").addEventListener("click", () => startStage(currentStageIndex));
document.getElementById("home-button").addEventListener("click", renderHome);
nextStageButton.addEventListener("click", () => startStage(currentStageIndex + 1));
document.getElementById("reset-button").addEventListener("click", () => {
  if (window.confirm("学習記録をリセットして、最初のステージからやり直しますか？")) {
    progress = { unlocked: 1, bestScores: {} };
    saveProgress();
    renderHome();
  }
});

renderHome();
