// localStorage に保存するときのキー
const STORAGE_KEY = "eigo-app-progress";

// 画面の要素
const screens = {
  home: document.getElementById("home-screen"),
  quiz: document.getElementById("quiz-screen"),
  conversation: document.getElementById("conversation-screen"),
  result: document.getElementById("result-screen")
};
const stageList = document.getElementById("stage-list");
const conversationList = document.getElementById("conversation-list");

// クイズ画面の要素
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

// 結果画面の要素
const resultIcon = document.getElementById("result-icon");
const resultTitle = document.getElementById("result-title");
const resultScore = document.getElementById("result-score");
const resultMessage = document.getElementById("result-message");
const nextStageButton = document.getElementById("next-stage-button");

// 会話シミュレーション画面の要素
const convTitle = document.getElementById("conv-title");
const convProgressText = document.getElementById("conv-progress-text");
const convProgressFill = document.getElementById("conv-progress-fill");
const chatLog = document.getElementById("chat-log");
const convChoiceArea = document.getElementById("conv-choice-area");
const convChoiceList = document.getElementById("conv-choice-list");
const convFeedback = document.getElementById("conv-feedback");
const convFeedbackResult = document.getElementById("conv-feedback-result");
const convAnswerEn = document.getElementById("conv-answer-en");
const convAnswerKana = document.getElementById("conv-answer-kana");
const convSpeakButton = document.getElementById("conv-speak-button");
const convExplanation = document.getElementById("conv-explanation");
const convNextButton = document.getElementById("conv-next-button");
const convEnd = document.getElementById("conv-end");
const convEndIcon = document.getElementById("conv-end-icon");
const convEndScore = document.getElementById("conv-end-score");
const convEndMessage = document.getElementById("conv-end-message");

// 発音機能（ブラウザが対応している場合のみ使う）
const canSpeak = "speechSynthesis" in window;

// クイズ中の状態
let currentStageIndex = 0;
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;

// 会話シミュレーション中の状態
let currentConversationIndex = 0;
let currentTurnIndex = 0;
let goodReplyCount = 0;

// 学習記録
// unlocked: 解放済みのステージ数 / bestScores: ステージごとの最高点
// conversationBest: 会話ごとの「いい返し」の最高数
let progress = loadProgress();

function createInitialProgress() {
  return { unlocked: 1, bestScores: {}, conversationBest: {} };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.unlocked === "number") {
      return {
        unlocked: saved.unlocked,
        bestScores: saved.bestScores || {},
        conversationBest: saved.conversationBest || {}
      };
    }
  } catch (error) {
    // 保存データが読めないときは最初から始める
  }
  return createInitialProgress();
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

// ステージ選択画面のカード（クイズ・会話の両方で使う）
function createCard({ icon, label, name, description, status, isLocked, isCleared, onClick }) {
  const item = document.createElement("li");
  const card = document.createElement("button");
  card.type = "button";
  card.className = "stage-card";
  card.disabled = isLocked;
  if (isCleared) {
    card.classList.add("is-cleared");
  }

  const iconElement = document.createElement("span");
  iconElement.className = "stage-icon";
  iconElement.textContent = icon;

  const body = document.createElement("span");
  body.className = "stage-body";
  const labelElement = document.createElement("span");
  labelElement.className = "stage-level";
  labelElement.textContent = label;
  const nameElement = document.createElement("span");
  nameElement.className = "stage-name";
  nameElement.textContent = name;
  const descElement = document.createElement("span");
  descElement.className = "stage-desc";
  descElement.textContent = description;
  body.append(labelElement, nameElement, descElement);

  const statusElement = document.createElement("span");
  statusElement.className = "stage-status";
  statusElement.textContent = status;

  card.append(iconElement, body, statusElement);
  card.addEventListener("click", onClick);
  item.append(card);
  return item;
}

function renderHome() {
  stageList.replaceChildren();
  STAGES.forEach((stage, index) => {
    const isLocked = index >= progress.unlocked;
    const best = progress.bestScores[stage.id];
    const total = stage.questions.length;
    const isCleared = best === total;

    let status = "";
    if (isCleared) {
      status = "★ クリア";
    } else if (best !== undefined) {
      status = `最高 ${best}/${total}`;
    }

    stageList.append(createCard({
      icon: isLocked ? "🔒" : stage.icon,
      label: `LEVEL ${index + 1}`,
      name: stage.title,
      description: isLocked ? `「${STAGES[index - 1].title}」を全問正解で解放` : stage.description,
      status,
      isLocked,
      isCleared,
      onClick: () => startStage(index)
    }));
  });

  conversationList.replaceChildren();
  CONVERSATIONS.forEach((conversation, index) => {
    const best = progress.conversationBest[conversation.id];
    const total = conversation.turns.length;

    let status = "";
    if (best === total) {
      status = "★ パーフェクト";
    } else if (best !== undefined) {
      status = `最高 ${best}/${total}`;
    }

    conversationList.append(createCard({
      icon: conversation.icon,
      label: "番外編",
      name: conversation.title,
      description: conversation.description,
      status,
      isLocked: false,
      isCleared: best === total,
      onClick: () => startConversation(index)
    }));
  });

  showScreen("home");
}

// 選択肢ボタン（クイズ・会話の両方で使う）
// choices の先頭が正解なので、印をつけてからシャッフルして並べる
function renderChoices(container, choices, onSelect) {
  const shuffled = shuffle(
    choices.map((choice, index) => ({ ...choice, isCorrect: index === 0 }))
  );

  container.replaceChildren();
  shuffled.forEach((choice) => {
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
    button.addEventListener("click", () => onSelect(button));
    container.append(button);
  });
}

// 回答後、全選択肢にカタカナを出して正解・不正解の色をつける
// 選んだ選択肢が正解なら true を返す
function revealChoices(container, selectedButton) {
  container.querySelectorAll(".choice-button").forEach((button) => {
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
  return selectedButton.dataset.correct === "true";
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
  renderChoices(choiceList, question.choices, (button) => handleAnswer(button, question));
}

function handleAnswer(selectedButton, question) {
  const isCorrect = revealChoices(choiceList, selectedButton);
  if (isCorrect) {
    correctCount++;
  }

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

// 番外編：会話シミュレーション
function startConversation(conversationIndex) {
  currentConversationIndex = conversationIndex;
  currentTurnIndex = 0;
  goodReplyCount = 0;
  convTitle.textContent = `番外編　${CONVERSATIONS[conversationIndex].title}`;
  chatLog.replaceChildren();
  convEnd.hidden = true;
  showScreen("conversation");
  renderTurn();
}

// 吹き出しを会話ログに追加する
// speaker は "customer"（お客様）か "therapist"（自分）
function addBubble(speaker, en, sub) {
  const bubble = document.createElement("div");
  bubble.className = `bubble bubble-${speaker}`;

  const name = document.createElement("p");
  name.className = "bubble-speaker";
  name.textContent = speaker === "customer" ? "お客様" : "あなた";

  const text = document.createElement("p");
  text.className = "bubble-en";
  text.textContent = en;

  const subText = document.createElement("p");
  subText.className = "bubble-sub";
  subText.textContent = sub;

  bubble.append(name, text, subText);

  if (speaker === "customer" && canSpeak) {
    const listenButton = document.createElement("button");
    listenButton.type = "button";
    listenButton.className = "speak-button";
    listenButton.textContent = "🔊 聞く";
    listenButton.addEventListener("click", () => speak(en));
    bubble.append(listenButton);
  }

  chatLog.append(bubble);
}

function updateConversationProgress() {
  const total = CONVERSATIONS[currentConversationIndex].turns.length;
  const shown = Math.min(currentTurnIndex + 1, total);
  convProgressText.textContent = `${shown} / ${total}ラリー`;
  convProgressFill.style.width = `${(currentTurnIndex / total) * 100}%`;
}

function renderTurn() {
  const turn = CONVERSATIONS[currentConversationIndex].turns[currentTurnIndex];
  updateConversationProgress();
  addBubble("customer", turn.customer, turn.ja);
  convFeedback.hidden = true;
  convChoiceArea.hidden = false;
  renderChoices(convChoiceList, turn.choices, (button) => handleReply(button, turn));
  convChoiceArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function handleReply(selectedButton, turn) {
  const isGood = revealChoices(convChoiceList, selectedButton);
  if (isGood) {
    goodReplyCount++;
  }

  const best = turn.choices[0];
  convFeedbackResult.textContent = isGood ? "⭕ いい返し！" : "🔺 もうひと工夫";
  convFeedbackResult.className = `feedback-result ${isGood ? "is-correct" : "is-wrong"}`;
  convAnswerEn.textContent = best.en;
  convAnswerKana.textContent = best.kana;
  convSpeakButton.hidden = !canSpeak;
  convExplanation.textContent = turn.explanation;

  const isLast = currentTurnIndex === CONVERSATIONS[currentConversationIndex].turns.length - 1;
  convNextButton.textContent = isLast ? "会話を終える" : "会話を続ける";
  convFeedback.hidden = false;
  convFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function continueConversation() {
  const conversation = CONVERSATIONS[currentConversationIndex];
  const turn = conversation.turns[currentTurnIndex];

  // 会話ログには、おすすめの返しを自分のセリフとして残す
  addBubble("therapist", turn.choices[0].en, turn.choices[0].kana);
  currentTurnIndex++;

  if (currentTurnIndex < conversation.turns.length) {
    renderTurn();
  } else {
    finishConversation();
  }
}

function finishConversation() {
  const conversation = CONVERSATIONS[currentConversationIndex];
  const total = conversation.turns.length;

  addBubble("customer", conversation.ending.customer, conversation.ending.ja);
  updateConversationProgress();
  convFeedback.hidden = true;
  convChoiceArea.hidden = true;

  const best = progress.conversationBest[conversation.id];
  if (best === undefined || goodReplyCount > best) {
    progress.conversationBest[conversation.id] = goodReplyCount;
    saveProgress();
  }

  convEndScore.textContent = `いい返し ${goodReplyCount} / ${total}`;
  if (goodReplyCount === total) {
    convEndIcon.textContent = "🎉";
    convEndMessage.textContent = "パーフェクト！お客様もとても満足そうです。";
  } else if (goodReplyCount >= total - 1) {
    convEndIcon.textContent = "😊";
    convEndMessage.textContent = "いい会話でした！あと少しでパーフェクトです。";
  } else {
    convEndIcon.textContent = "📖";
    convEndMessage.textContent = "解説を思い出して、もう一度話してみましょう。";
  }
  convEnd.hidden = false;
  convEnd.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ボタンのイベント
speakButton.addEventListener("click", () => speak(answerEn.textContent));
nextButton.addEventListener("click", goToNextQuestion);
document.getElementById("quit-button").addEventListener("click", renderHome);
document.getElementById("retry-button").addEventListener("click", () => startStage(currentStageIndex));
document.getElementById("home-button").addEventListener("click", renderHome);
nextStageButton.addEventListener("click", () => startStage(currentStageIndex + 1));

convSpeakButton.addEventListener("click", () => speak(convAnswerEn.textContent));
convNextButton.addEventListener("click", continueConversation);
document.getElementById("conv-retry-button").addEventListener("click", () => startConversation(currentConversationIndex));
document.getElementById("conv-quit-button").addEventListener("click", renderHome);

document.getElementById("reset-button").addEventListener("click", () => {
  if (window.confirm("学習記録をリセットして、最初のステージからやり直しますか？")) {
    progress = createInitialProgress();
    saveProgress();
    renderHome();
  }
});

renderHome();
