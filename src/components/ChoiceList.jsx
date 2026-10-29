import { useState } from "react";
import { shuffle } from "../lib/utils";

// 3択の選択肢（クイズ・会話の両方で使う）
// choices の先頭が正解。表示時にシャッフルし、回答後は全選択肢にカタカナを出す
// 問題が変わったときは、親で key を変えて作り直す
export default function ChoiceList({ choices, onAnswer }) {
  const [shuffled] = useState(() =>
    shuffle(choices.map((choice, index) => ({ ...choice, isCorrect: index === 0 })))
  );
  const [selectedIndex, setSelectedIndex] = useState(null);
  const answered = selectedIndex !== null;

  function handleClick(index) {
    if (answered) {
      return;
    }
    setSelectedIndex(index);
    onAnswer(shuffled[index].isCorrect);
  }

  return (
    <div className="choice-list">
      {shuffled.map((choice, index) => {
        let stateClass = "";
        if (answered) {
          if (choice.isCorrect) {
            stateClass = "is-correct";
          } else if (index === selectedIndex) {
            stateClass = "is-wrong";
          } else {
            stateClass = "is-dimmed";
          }
        }

        return (
          <button
            key={choice.en}
            type="button"
            className={`choice-button ${stateClass}`}
            disabled={answered}
            onClick={() => handleClick(index)}
          >
            <span className="choice-en">{choice.en}</span>
            {answered && <span className="choice-kana">{choice.kana}</span>}
          </button>
        );
      })}
    </div>
  );
}
