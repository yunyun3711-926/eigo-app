import { STAGES } from "../data/questions";

// user_levels の行の配列を { ステージID: 行 } の形にする
export function toLevelMap(rows) {
  return Object.fromEntries(rows.map((row) => [row.stage_id, row]));
}

// ステージが解放されているかを判定する
// LEVEL 1 は最初から解放。それ以降は、解放済みの記録があるか、前のステージをクリア済みなら解放
export function isStageUnlocked(levelMap, stageIndex) {
  if (stageIndex === 0) {
    return true;
  }
  const level = levelMap[STAGES[stageIndex].id];
  const previous = levelMap[STAGES[stageIndex - 1].id];
  return Boolean(level?.is_unlocked || previous?.is_cleared);
}

// question_stats の行の配列から、ステージごとの正解回数の合計を出す
export function sumCorrectByStage(rows) {
  const totals = {};
  rows.forEach((row) => {
    totals[row.stage_id] = (totals[row.stage_id] ?? 0) + row.correct_count;
  });
  return totals;
}
