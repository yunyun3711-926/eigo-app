import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { STAGES } from "../data/questions";
import { CONVERSATIONS } from "../data/conversations";
import { createInitialProgress, loadProgress, saveProgress } from "../lib/progress";

// クイズ選択画面（シンプルなフォーム）
// 選択肢の値は "quiz:ステージID" または "conversation:会話ID"
export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(() => loadProgress(user.id));
  const [selected, setSelected] = useState(`quiz:${STAGES[0].id}`);

  function handleSubmit(event) {
    event.preventDefault();
    const [type, id] = selected.split(":");
    navigate(type === "quiz" ? `/quiz/${id}` : `/conversation/${id}`);
  }

  function handleReset() {
    if (window.confirm("学習記録をリセットして、最初のステージからやり直しますか？")) {
      const initial = createInitialProgress();
      saveProgress(user.id, initial);
      setProgress(initial);
      setSelected(`quiz:${STAGES[0].id}`);
    }
  }

  return (
    <form className="simple-form" onSubmit={handleSubmit}>
      <h2 className="form-title">クイズを選ぶ</h2>

      <fieldset className="form-group">
        <legend className="form-label">クイズ（全問正解で次のレベルへ）</legend>
        {STAGES.map((stage, index) => {
          const isLocked = index >= progress.unlocked;
          const best = progress.bestScores[stage.id];
          const total = stage.questions.length;

          let status = "";
          if (isLocked) {
            status = "🔒 前のレベルを全問正解で解放";
          } else if (best === total) {
            status = "★ クリア";
          } else if (best !== undefined) {
            status = `最高 ${best}/${total}`;
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
                {status && <span className="radio-status">{status}</span>}
              </span>
            </label>
          );
        })}
      </fieldset>

      <fieldset className="form-group">
        <legend className="form-label">番外編：会話シミュレーション（いつでも遊べます）</legend>
        {CONVERSATIONS.map((conversation) => {
          const best = progress.conversationBest[conversation.id];
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
      <button type="button" className="text-button" onClick={handleReset}>学習記録をリセット</button>
    </form>
  );
}
