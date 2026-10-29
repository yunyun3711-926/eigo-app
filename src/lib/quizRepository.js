import { supabase } from "./supabaseClient";

// Supabase の学習データを読み書きする関数をまとめたファイル
// テーブルの定義は supabase/schema.sql を参照
// RLS により、どの操作もログイン中の本人の行にしか効かない

// エラーがあれば投げ、なければデータを返す
function unwrap({ data, error }) {
  if (error) {
    throw error;
  }
  return data;
}

function now() {
  return new Date().toISOString();
}

// ===== レベル管理（user_levels） =====

// 【Read】自分の全ステージのレベル情報を取得する
export async function fetchLevels(userId) {
  return unwrap(
    await supabase
      .from("user_levels")
      .select("stage_id, is_unlocked, is_cleared, best_score")
      .eq("user_id", userId)
  );
}

// 【Create / Update】ステージの結果（最高点・クリア状況）を保存する
export async function saveStageResult(userId, stageId, { bestScore, isCleared }) {
  unwrap(
    await supabase.from("user_levels").upsert({
      user_id: userId,
      stage_id: stageId,
      is_unlocked: true,
      is_cleared: isCleared,
      best_score: bestScore,
      updated_at: now()
    })
  );
}

// 【Create / Update】ステージを解放する（最高点などの既存の値はそのまま）
export async function unlockStage(userId, stageId) {
  unwrap(
    await supabase.from("user_levels").upsert({
      user_id: userId,
      stage_id: stageId,
      is_unlocked: true,
      updated_at: now()
    })
  );
}

// ===== 問題管理（question_stats） =====

// 【Read】自分の問題ごとの成績を取得する（stageId を渡すとそのステージだけ）
export async function fetchQuestionStats(userId, stageId) {
  let query = supabase
    .from("question_stats")
    .select("question_id, stage_id, correct_count, answer_count")
    .eq("user_id", userId);
  if (stageId) {
    query = query.eq("stage_id", stageId);
  }
  return unwrap(await query);
}

// 【Create / Update】問題ごとの正解回数・回答回数を保存する
export async function saveQuestionStat(userId, { questionId, stageId, correctCount, answerCount }) {
  unwrap(
    await supabase.from("question_stats").upsert({
      user_id: userId,
      question_id: questionId,
      stage_id: stageId,
      correct_count: correctCount,
      answer_count: answerCount,
      last_answered_at: now()
    })
  );
}

// ===== 回答結果管理（answer_results） =====

// 【Create】1回分の回答結果を履歴として登録する
export async function recordAnswerResult(userId, { stageId, questionId, selectedAnswer, isCorrect }) {
  unwrap(
    await supabase.from("answer_results").insert({
      user_id: userId,
      stage_id: stageId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      is_correct: isCorrect
    })
  );
}

// ===== リセット =====

// 【Delete】自分のクイズの学習データをすべて削除する
export async function deleteAllQuizData(userId) {
  const results = await Promise.all([
    supabase.from("answer_results").delete().eq("user_id", userId),
    supabase.from("question_stats").delete().eq("user_id", userId),
    supabase.from("user_levels").delete().eq("user_id", userId)
  ]);
  results.forEach(unwrap);
}
