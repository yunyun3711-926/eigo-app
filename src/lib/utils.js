// 配列をシャッフルした新しい配列を返す
export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 発音機能（ブラウザが対応している場合のみ使う）
export const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text) {
  if (!canSpeak) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}
