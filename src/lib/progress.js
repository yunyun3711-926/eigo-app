// 学習記録を localStorage に保存・読み込みする
// 同じブラウザで別のアカウントを使っても混ざらないよう、ユーザーごとにキーを分ける
const STORAGE_KEY_PREFIX = "eigo-app-progress";

function storageKey(userId) {
  return `${STORAGE_KEY_PREFIX}-${userId}`;
}

// unlocked: 解放済みのステージ数 / bestScores: ステージごとの最高点
// conversationBest: 会話ごとの「いい返し」の最高数
export function createInitialProgress() {
  return { unlocked: 1, bestScores: {}, conversationBest: {} };
}

export function loadProgress(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)));
    if (saved && typeof saved.unlocked === "number") {
      return {
        unlocked: saved.unlocked,
        bestScores: saved.bestScores || {},
        conversationBest: saved.conversationBest || {}
      };
    }
  } catch (error) {
    // 保存データが読めないときは最初から始める
  }
  return createInitialProgress();
}

export function saveProgress(userId, progress) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(progress));
  } catch (error) {
    // 保存できない環境（プライベートモードなど）でもアプリは動かす
  }
}
