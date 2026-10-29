import { canSpeak, speak } from "../lib/utils";

// 回答後の判定・正解（おすすめ）の英語とカタカナ・解説を表示する
// note を渡すと、判定の下に補足（正解回数など）を表示する
export default function Feedback({ isCorrect, resultText, note, answerLabel, answer, explanation, nextLabel, onNext }) {
  return (
    <div className="feedback">
      <p className={`feedback-result ${isCorrect ? "is-correct" : "is-wrong"}`}>{resultText}</p>
      {note && <p className="feedback-note">{note}</p>}
      <div className="answer-box">
        <p className="answer-label">{answerLabel}</p>
        <p className="answer-en">{answer.en}</p>
        <p className="answer-kana">{answer.kana}</p>
        {canSpeak && (
          <button type="button" className="speak-button" onClick={() => speak(answer.en)}>
            🔊 発音を聞く
          </button>
        )}
      </div>
      <p className="feedback-explanation">{explanation}</p>
      <button type="button" className="primary-button" onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  );
}
