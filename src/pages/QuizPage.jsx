import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { STAGES } from "../data/questions";
import { loadProgress, saveProgress } from "../lib/progress";
import { shuffle } from "../lib/utils";
import ChoiceList from "../components/ChoiceList";
import Feedback from "../components/Feedback";

// ステージやリトライ回数が変わったら、key を変えてクイズを最初から作り直す
export default function QuizPage() {
  const { stageId } = useParams();
  const [round, setRound] = useState(0);
  return <QuizGame key={`${stageId}-${round}`} stageId={stageId} onRetry={() => setRound((r) => r + 1)} />;
}

function QuizGame({ stageId, onRetry }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const stageIndex = STAGES.findIndex((stage) => stage.id === stageId);
  const stage = STAGES[stageIndex];

  const [progress] = useState(() => loadProgress(user.id));
  const [questions] = useState(() => (stage ? shuffle(stage.questions) : []));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  // null: 未回答 / true: 正解 / false: 不正解
  const [lastAnswer, setLastAnswer] = useState(null);
  const [result, setResult] = useState(null);

  // 存在しないステージや、まだ解放されていないステージはトップへ戻す
  if (!stage || stageIndex >= progress.unlocked) {
    return <Navigate to="/" replace />;
  }

  const total = questions.length;
  const question = questions[currentIndex];
  const isLast = currentIndex === total - 1;

  function handleAnswer(isCorrect) {
    setLastAnswer(isCorrect);
    if (isCorrect) {
      setCorrectCount((count) => count + 1);
    }
  }

  function handleNext() {
    if (!isLast) {
      setCurrentIndex((index) => index + 1);
      setLastAnswer(null);
      window.scrollTo(0, 0);
      return;
    }
    finish();
  }

  function finish() {
    const isPerfect = correctCount === total;
    const hasNextStage = stageIndex < STAGES.length - 1;

    // 最新の記録を読み直してから更新する
    const latest = loadProgress(user.id);
    const best = latest.bestScores[stage.id];
    if (best === undefined || correctCount > best) {
      latest.bestScores[stage.id] = correctCount;
    }

    // 全問正解なら次のステージを解放
    let leveledUp = false;
    if (isPerfect && hasNextStage && latest.unlocked <= stageIndex + 1) {
      latest.unlocked = stageIndex + 2;
      leveledUp = true;
    }
    saveProgress(user.id, latest);

    setResult({ isPerfect, hasNextStage, leveledUp });
    window.scrollTo(0, 0);
  }

  if (result) {
    const { isPerfect, hasNextStage, leveledUp } = result;
    const remaining = total - correctCount;
    let icon;
    let title;
    let message;

    if (isPerfect && !hasNextStage) {
      icon = "🏆";
      title = "全ステージクリア！";
      message = "おめでとうございます！接客英語はばっちりです。実際の接客でもぜひ使ってみてください。";
    } else if (isPerfect) {
      icon = "🎉";
      title = leveledUp ? "レベルアップ！" : "全問正解！";
      message = `次は「${STAGES[stageIndex + 1].title}」に挑戦しましょう。`;
    } else {
      icon = correctCount >= total * 0.7 ? "👍" : "📖";
      title = "おつかれさまでした";
      message = hasNextStage
        ? `あと${remaining}問！全問正解で次のステージに進めます。`
        : `あと${remaining}問で全問正解です。もう一度挑戦してみましょう。`;
    }

    return (
      <section>
        <div className="result-card">
          <p className="result-icon">{icon}</p>
          <h2 className="result-title">{title}</h2>
          <p className="result-score">{correctCount} / {total}</p>
          <p className="result-message">{message}</p>
        </div>
        <div className="result-actions">
          {isPerfect && hasNextStage && (
            <button
              type="button"
              className="primary-button"
              onClick={() => navigate(`/quiz/${STAGES[stageIndex + 1].id}`)}
            >
              次のステージへ進む
            </button>
          )}
          <button type="button" className="secondary-button" onClick={onRetry}>
            もう一度チャレンジ
          </button>
          <Link to="/" className="text-button">クイズ選択にもどる</Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="quiz-top">
        <span className="stage-tag">LEVEL {stageIndex + 1}　{stage.title}</span>
        <span className="progress-text">{currentIndex + 1} / {total}問</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(currentIndex / total) * 100}%` }} />
      </div>

      <div className="question-card">
        <p className="question-label">この日本語を英語で言うと？</p>
        <p className="question-text">{question.ja}</p>
      </div>

      <ChoiceList key={currentIndex} choices={question.choices} onAnswer={handleAnswer} />

      {lastAnswer !== null && (
        <Feedback
          isCorrect={lastAnswer}
          resultText={lastAnswer ? "⭕ 正解！" : "❌ 不正解…"}
          answerLabel="正解"
          answer={question.choices[0]}
          explanation={question.explanation}
          nextLabel={isLast ? "結果を見る" : "次の問題へ"}
          onNext={handleNext}
        />
      )}

      <Link to="/" className="text-button">クイズ選択にもどる</Link>
    </section>
  );
}
