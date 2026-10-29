-- =============================================================
-- セラピスト向け英語アプリ（eigo-app）のテーブル定義
-- Supabase ダッシュボードの「SQL Editor」に貼り付けて実行する
--
-- 問題文・選択肢そのものはアプリ側（src/data/questions.js）にあり、
-- ここではユーザーごとの学習データだけを保存する
-- =============================================================


-- -------------------------------------------------------------
-- 1. レベル管理（user_levels）
--    ユーザー × ステージごとに、解放状況・クリア状況・最高点を保存する
-- -------------------------------------------------------------
create table if not exists public.user_levels (
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  stage_id    text        not null,                          -- 例: 'reception'
  is_unlocked boolean     not null default false,            -- そのステージが開いているか
  is_cleared  boolean     not null default false,            -- 一度でも全問正解したか
  best_score  integer     not null default 0 check (best_score >= 0),
  updated_at  timestamptz not null default now(),
  primary key (user_id, stage_id)
);


-- -------------------------------------------------------------
-- 2. 問題管理（question_stats）
--    ユーザー × 問題ごとに、正解した回数・回答した回数を保存する
-- -------------------------------------------------------------
create table if not exists public.question_stats (
  user_id          uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  question_id      text        not null,                     -- 例: 'reception-01'
  stage_id         text        not null,
  correct_count    integer     not null default 0 check (correct_count >= 0),
  answer_count     integer     not null default 0 check (answer_count >= 0),
  last_answered_at timestamptz not null default now(),
  primary key (user_id, question_id)
);


-- -------------------------------------------------------------
-- 3. 回答結果管理（answer_results）
--    1回答ごとの履歴（どの問題に、何を選び、正解だったか）を保存する
-- -------------------------------------------------------------
create table if not exists public.answer_results (
  id              bigint      generated always as identity primary key,
  user_id         uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  stage_id        text        not null,
  question_id     text        not null,
  selected_answer text        not null,                      -- 選んだ英文
  is_correct      boolean     not null,
  answered_at     timestamptz not null default now()
);

create index if not exists answer_results_user_answered_idx
  on public.answer_results (user_id, answered_at desc);


-- =============================================================
-- RLS（行レベルセキュリティ）
-- どのテーブルも「ログイン中の本人の行」だけを読み書きできる
-- =============================================================
alter table public.user_levels    enable row level security;
alter table public.question_stats enable row level security;
alter table public.answer_results enable row level security;


-- ---------- user_levels ----------
create policy "本人のレベルのみ閲覧できる"
  on public.user_levels for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "本人のレベルのみ登録できる"
  on public.user_levels for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "本人のレベルのみ更新できる"
  on public.user_levels for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "本人のレベルのみ削除できる"
  on public.user_levels for delete to authenticated
  using ((select auth.uid()) = user_id);


-- ---------- question_stats ----------
create policy "本人の問題成績のみ閲覧できる"
  on public.question_stats for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "本人の問題成績のみ登録できる"
  on public.question_stats for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "本人の問題成績のみ更新できる"
  on public.question_stats for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "本人の問題成績のみ削除できる"
  on public.question_stats for delete to authenticated
  using ((select auth.uid()) = user_id);


-- ---------- answer_results ----------
-- 回答履歴は記録として残すため、更新（update）のポリシーは作らない
create policy "本人の回答結果のみ閲覧できる"
  on public.answer_results for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "本人の回答結果のみ登録できる"
  on public.answer_results for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "本人の回答結果のみ削除できる"
  on public.answer_results for delete to authenticated
  using ((select auth.uid()) = user_id);
