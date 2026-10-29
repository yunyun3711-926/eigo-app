// 番外編（会話シミュレーション）の最高記録を localStorage に保存・読み込みする
// クイズの学習記録は Supabase に保存している（quizRepository.js）
// 同じブラウザで別のアカウントを使っても混ざらないよう、ユーザーごとにキーを分ける
const STORAGE_KEY_PREFIX = "eigo-app-conversation-best";

function storageKey(userId) {
  return `${STORAGE_KEY_PREFIX}-${userId}`;
}

// { 会話ID: いい返しの最高数 } を返す
export function loadConversationBest(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)));
    if (saved && typeof saved === "object") {
      return saved;
    }
  } catch (error) {
    // 保存データが読めないときは記録なしとして扱う
  }
  return {};
}

export function saveConversationBest(userId, bestMap) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(bestMap));
  } catch (error) {
    // 保存できない環境（プライベートモードなど）でもアプリは動かす
  }
}
