import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { STAGES } from "../data/questions";
import { CONVERSATIONS } from "../data/conversations";
import { deleteAllQuizData, fetchLevels, fetchQuestionStats } from "../lib/quizRepository";
import { isStageUnlocked, sumCorrectByStage, toLevelMap } from "../lib/levels";
import { loadConversationBest, saveConversationBest } from "../lib/progress";

// クイズ選択画面（シンプルなフォーム）
// 選択肢の値は "quiz:ステージID" または "conversation:会話ID"
export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // null の間は Supabase から読み込み中
  const [levelMap, setLevelMap] = useState(null);
  const [correctTotals, setCorrectTotals] = useState({});
  const [conversationBest, setConversationBest] = useState(() => loadConversationBest(user.id));
  const [selected, setSelected] = useState(`quiz:${STAGES[0].id}`);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetting, setResetting] = useState(false);
  // 値を変えると学習記録を読み込み直す
  const [reloadKey, setReloadKey] = useState(0);

  // 【Read】レベルと問題ごとの成績を Supabase から読み込む
  useEffect(() => {
    let ignore = false;
    Promise.all([fetchLevels(user.id), fetchQuestionStats(user.id)])
      .then(([levels, stats]) => {
        if (ignore) {
          return;
        }
        setLevelMap(toLevelMap(levels));
        setCorrectTotals(sumCorrectByStage(stats));
      })
      .catch(() => {
        if (ignore) {
          return;
        }
        // 読み込めなくても LEVEL 1 と番外編は遊べるようにする
        setLevelMap({});
        setErrorMessage("学習記録を読み込めませんでした。通信状況を確認して、ページを再読み込みしてください。");
      });
    return () => {
      ignore = true;
    };
  }, [user.id, reloadKey]);

  function handleSubmit(event) {
    event.preventDefault();
    const [type, id] = selected.split(":");
    navigate(type === "quiz" ? `/quiz/${id}` : `/conversation/${id}`);
  }

  // 【Delete】学習記録をすべて削除する
  async function handleReset() {
    if (!window.confirm("学習記録をリセットして、最初のステージからやり直しますか？")) {
      return;
    }
    setResetting(true);
    setErrorMessage("");
    try {
      await deleteAllQuizData(user.id);
      saveConversationBest(user.id, {});
      setConversationBest({});
      setSelected(`quiz:${STAGES[0].id}`);
      setLevelMap(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setErrorMessage("リセットできませんでした。時間をおいてもう一度お試しください。");
    }
    setResetting(false);
  }

  if (levelMap === null) {
    return <p className="loading">学習記録を読み込み中…</p>;
  }

  return (
    <form className="simple-form" onSubmit={handleSubmit}>
      <h2 className="form-title">クイズを選ぶ</h2>

      {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}

      <fieldset className="form-group">
        <legend className="form-label">クイズ（全問正解で次のレベルへ）</legend>
        {STAGES.map((stage, index) => {
          const isLocked = !isStageUnlocked(levelMap, index);
          const level = levelMap[stage.id];
          const total = stage.questions.length;
          const correctTotal = correctTotals[stage.id] ?? 0;

          const statusParts = [];
          if (isLocked) {
            statusParts.push("🔒 前のレベルを全問正解で解放");
          } else if (level?.is_cleared) {
            statusParts.push("★ クリア");
          } else if (level) {
            statusParts.push(`最高 ${level.best_score}/${total}`);
          }
          if (correctTotal > 0) {
            statusParts.push(`累計正解 ${correctTotal}回`);
          }

          return (
            <label key={stage.id} className={`radio-option ${isLocked ? "is-locked" : ""}`}>
              <input
                type="radio"
                name="target"
                value={`quiz:${stage.id}`}
                checked={selected === `quiz:${stage.id}`}
                onChange={(event) => setSelected(event.target.value)}
                disabled={isLocked}
              />
              <span className="radio-text">
                LEVEL {index + 1}　{stage.title}
                {statusParts.length > 0 && <span className="radio-status">{statusParts.join("　")}</span>}
              </span>
            </label>
          );
        })}
      </fieldset>

      <fieldset className="form-group">
        <legend className="form-label">番外編：会話シミュレーション（いつでも遊べます）</legend>
        {CONVERSATIONS.map((conversation) => {
          const best = conversationBest[conversation.id];
          const total = conversation.turns.length;

          let status = "";
          if (best === total) {
            status = "★ パーフェクト";
          } else if (best !== undefined) {
            status = `最高 ${best}/${total}`;
          }

          return (
            <label key={conversation.id} className="radio-option">
              <input
                type="radio"
                name="target"
                value={`conversation:${conversation.id}`}
                checked={selected === `conversation:${conversation.id}`}
                onChange={(event) => setSelected(event.target.value)}
              />
              <span className="radio-text">
                {conversation.icon} {conversation.title}
                {status && <span className="radio-status">{status}</span>}
              </span>
            </label>
          );
        })}
      </fieldset>

      <button type="submit" className="primary-button">スタート</button>
      <button type="button" className="text-button" onClick={handleReset} disabled={resetting}>
        {resetting ? "リセット中…" : "学習記録をリセット"}
      </button>
    </form>
  );
}
