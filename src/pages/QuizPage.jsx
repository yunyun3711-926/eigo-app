import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { STAGES } from "../data/questions";
import {
  fetchLevels,
  fetchQuestionStats,
  recordAnswerResult,
  saveQuestionStat,
  saveStageResult,
  unlockStage
} from "../lib/quizRepository";
import { isStageUnlocked, toLevelMap } from "../lib/levels";
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

  // null の間は Supabase から読み込み中
  const [levelMap, setLevelMap] = useState(null);
  // { 問題ID: { correct_count, answer_count } }
  const [statMap, setStatMap] = useState({});
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const [questions] = useState(() => (stage ? shuffle(stage.questions) : []));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  // null: 未回答 / true: 正解 / false: 不正解
  const [lastAnswer, setLastAnswer] = useState(null);
  const [result, setResult] = useState(null);

  // 【Read】レベルとこのステージの問題ごとの成績を読み込む
  useEffect(() => {
    if (!stage) {
      return undefined;
    }
    let ignore = false;
    Promise.all([fetchLevels(user.id), fetchQuestionStats(user.id, stage.id)])
      .then(([levels, stats]) => {
        if (ignore) {
          return;
        }
        setLevelMap(toLevelMap(levels));
        setStatMap(Object.fromEntries(stats.map((row) => [row.question_id, row])));
      })
      .catch(() => {
        if (!ignore) {
          setLoadError("学習記録を読み込めませんでした。通信状況を確認して、もう一度お試しください。");
        }
      });
    return () => {
      ignore = true;
    };
  }, [user.id, stage]);

  if (!stage) {
    return <Navigate to="/" replace />;
  }

  if (loadError) {
    return (
      <section className="simple-form">
        <p className="error-message" role="alert">{loadError}</p>
        <Link to="/" className="text-button">クイズ選択にもどる</Link>
      </section>
    );
  }

  if (levelMap === null) {
    return <p className="loading">読み込み中…</p>;
  }

  // まだ解放されていないステージはトップへ戻す
  if (!isStageUnlocked(levelMap, stageIndex)) {
    return <Navigate to="/" replace />;
  }

  const total = questions.length;
  const question = questions[currentIndex];
  const isLast = currentIndex === total - 1;
  const questionStat = statMap[question.id];

  function handleAnswer(isCorrect, choice) {
    setLastAnswer(isCorrect);
    if (isCorrect) {
      setCorrectCount((count) => count + 1);
    }

    // 正解回数・回答回数を1つ増やす
    const nextStat = {
      correct_count: (questionStat?.correct_count ?? 0) + (isCorrect ? 1 : 0),
      answer_count: (questionStat?.answer_count ?? 0) + 1
    };
    setStatMap((current) => ({ ...current, [question.id]: nextStat }));

    // 【Create】回答結果の履歴 ／ 【Create・Update】問題ごとの成績 を保存する
    // 保存を待たずに解説を表示し、失敗したときだけ知らせる
    Promise.all([
      recordAnswerResult(user.id, {
        stageId: stage.id,
        questionId: question.id,
        selectedAnswer: choice.en,
        isCorrect
      }),
      saveQuestionStat(user.id, {
        questionId: question.id,
        stageId: stage.id,
        correctCount: nextStat.correct_count,
        answerCount: nextStat.answer_count
      })
    ]).catch(() => {
      setSaveError("回答の記録を保存できませんでした。通信状況を確認してください。");
    });
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

  // 【Create・Update】ステージの結果を保存し、全問正解なら次のステージを解放する
  async function finish() {
    const isPerfect = correctCount === total;
    const hasNextStage = stageIndex < STAGES.length - 1;
    const currentLevel = levelMap[stage.id];
    const leveledUp = isPerfect && hasNextStage && !isStageUnlocked(levelMap, stageIndex + 1);

    setSaving(true);
    try {
      await saveStageResult(user.id, stage.id, {
        bestScore: Math.max(currentLevel?.best_score ?? 0, correctCount),
        isCleared: Boolean(currentLevel?.is_cleared) || isPerfect
      });
      if (isPerfect && hasNextStage) {
        await unlockStage(user.id, STAGES[stageIndex + 1].id);
      }
    } catch (error) {
      setSaveError("結果を保存できませんでした。通信状況を確認して、もう一度お試しください。");
    }
    setSaving(false);

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
        {saveError && <p className="error-message" role="alert">{saveError}</p>}
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

      {saveError && <p className="error-message" role="alert">{saveError}</p>}

      <div className="question-card">
        <p className="question-label">この日本語を英語で言うと？</p>
        <p className="question-text">{question.ja}</p>
      </div>

      <ChoiceList key={currentIndex} choices={question.choices} onAnswer={handleAnswer} />

      {lastAnswer !== null && (
        <Feedback
          isCorrect={lastAnswer}
          resultText={lastAnswer ? "⭕ 正解！" : "❌ 不正解…"}
          note={`この問題の正解回数：累計 ${questionStat?.correct_count ?? 0}回（${questionStat?.answer_count ?? 0}回中）`}
          answerLabel="正解"
          answer={question.choices[0]}
          explanation={question.explanation}
          nextLabel={saving ? "保存中…" : isLast ? "結果を見る" : "次の問題へ"}
          onNext={saving ? undefined : handleNext}
        />
      )}

      <Link to="/" className="text-button">クイズ選択にもどる</Link>
    </section>
  );
}
