import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CONVERSATIONS } from "../data/conversations";
import { loadConversationBest, saveConversationBest } from "../lib/progress";
import ChoiceList from "../components/ChoiceList";
import Feedback from "../components/Feedback";
import Bubble from "../components/Bubble";

// 会話やリトライ回数が変わったら、key を変えて会話を最初から作り直す
export default function ConversationPage() {
  const { conversationId } = useParams();
  const [round, setRound] = useState(0);
  return (
    <ConversationGame
      key={`${conversationId}-${round}`}
      conversationId={conversationId}
      onRetry={() => setRound((r) => r + 1)}
    />
  );
}

function ConversationGame({ conversationId, onRetry }) {
  const { user } = useAuth();
  const conversation = CONVERSATIONS.find((item) => item.id === conversationId);

  const [turnIndex, setTurnIndex] = useState(0);
  const [goodCount, setGoodCount] = useState(0);
  // null: 未回答 / true: いい返し / false: もうひと工夫
  const [lastAnswer, setLastAnswer] = useState(null);
  const [finished, setFinished] = useState(false);
  // 会話ログ（吹き出しの一覧）。最初はお客様の1つ目のセリフ
  const [log, setLog] = useState(() =>
    conversation
      ? [{ speaker: "customer", en: conversation.turns[0].customer, sub: conversation.turns[0].ja }]
      : []
  );
  const bottomRef = useRef(null);

  // 吹き出しや解説が増えたら、画面の下までスクロールする
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log.length, lastAnswer, finished]);

  if (!conversation) {
    return <Navigate to="/" replace />;
  }

  const total = conversation.turns.length;
  const turn = conversation.turns[turnIndex];
  const isLast = turnIndex === total - 1;
  const shownTurn = Math.min(turnIndex + 1, total);

  function handleAnswer(isGood) {
    setLastAnswer(isGood);
    if (isGood) {
      setGoodCount((count) => count + 1);
    }
  }

  function handleNext() {
    // 会話ログには、おすすめの返しを自分のセリフとして残す
    const best = turn.choices[0];
    const myBubble = { speaker: "therapist", en: best.en, sub: best.kana };

    if (!isLast) {
      const nextTurn = conversation.turns[turnIndex + 1];
      setLog((current) => [
        ...current,
        myBubble,
        { speaker: "customer", en: nextTurn.customer, sub: nextTurn.ja }
      ]);
      setTurnIndex((index) => index + 1);
      setLastAnswer(null);
      return;
    }

    // 最後はお客様のひと言で締めくくる
    setLog((current) => [
      ...current,
      myBubble,
      { speaker: "customer", en: conversation.ending.customer, sub: conversation.ending.ja }
    ]);

    const bestMap = loadConversationBest(user.id);
    const bestCount = bestMap[conversation.id];
    if (bestCount === undefined || goodCount > bestCount) {
      saveConversationBest(user.id, { ...bestMap, [conversation.id]: goodCount });
    }
    setFinished(true);
  }

  let endIcon = "📖";
  let endMessage = "解説を思い出して、もう一度話してみましょう。";
  if (goodCount === total) {
    endIcon = "🎉";
    endMessage = "パーフェクト！お客様もとても満足そうです。";
  } else if (goodCount >= total - 1) {
    endIcon = "😊";
    endMessage = "いい会話でした！あと少しでパーフェクトです。";
  }

  return (
    <section>
      <div className="quiz-top">
        <span className="stage-tag">番外編　{conversation.title}</span>
        <span className="progress-text">{shownTurn} / {total}ラリー</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((finished ? total : turnIndex) / total) * 100}%` }}
        />
      </div>

      <div className="chat-log">
        {log.map((bubble, index) => (
          <Bubble key={index} speaker={bubble.speaker} en={bubble.en} sub={bubble.sub} />
        ))}
      </div>

      {!finished && (
        <div>
          <p className="question-label">あなたの返事を選んでください</p>
          <ChoiceList key={turnIndex} choices={turn.choices} onAnswer={handleAnswer} />
        </div>
      )}

      {!finished && lastAnswer !== null && (
        <Feedback
          isCorrect={lastAnswer}
          resultText={lastAnswer ? "⭕ いい返し！" : "🔺 もうひと工夫"}
          answerLabel="おすすめの返し"
          answer={turn.choices[0]}
          explanation={turn.explanation}
          nextLabel={isLast ? "会話を終える" : "会話を続ける"}
          onNext={handleNext}
        />
      )}

      {finished && (
        <div>
          <div className="result-card">
            <p className="result-icon">{endIcon}</p>
            <h2 className="result-title">会話終了</h2>
            <p className="result-score">いい返し {goodCount} / {total}</p>
            <p className="result-message">{endMessage}</p>
          </div>
          <div className="result-actions">
            <button type="button" className="secondary-button" onClick={onRetry}>
              もう一度話す
            </button>
          </div>
        </div>
      )}

      <Link to="/" className="text-button">クイズ選択にもどる</Link>
      <div ref={bottomRef} />
    </section>
  );
}
