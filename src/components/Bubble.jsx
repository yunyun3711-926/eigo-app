import { canSpeak, speak } from "../lib/utils";

// 会話シミュレーションの吹き出し
// speaker は "customer"（お客様）か "therapist"（自分）
export default function Bubble({ speaker, en, sub }) {
  const isCustomer = speaker === "customer";

  return (
    <div className={`bubble bubble-${speaker}`}>
      <p className="bubble-speaker">{isCustomer ? "お客様" : "あなた"}</p>
      <p className="bubble-en">{en}</p>
      <p className="bubble-sub">{sub}</p>
      {isCustomer && canSpeak && (
        <button type="button" className="speak-button" onClick={() => speak(en)}>
          🔊 聞く
        </button>
      )}
    </div>
  );
}
