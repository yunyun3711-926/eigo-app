# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code へのガイドです。

## プロジェクト概要

- **プロジェクト名**: eigo-app
- **内容**: セラピスト向けの英語学習 Web アプリ
- **目的**: クイズ形式で、施術・接客の場面で使う英単語やフレーズに慣れてもらう
- **想定ユーザー**: 外国人のお客様を接客するセラピスト（英語は初心者〜初級者を想定）
- **技術スタック**: React 18 + Vite 5 / React Router 6 / Supabase（メール＋パスワード認証）

## コミュニケーション

- Claude の返答は日本語で行う。
- コード内のコメントも日本語で書く。

## 開発方針

- React + Vite で構成する。新しいライブラリは、明示的に指示がない限り追加しない。
- 認証は Supabase Auth を使う。未ログインで保護ページを開くと `/login` にリダイレクトする。
- 外部ライブラリが必要な場合は、まず相談してから npm で追加する。

## コマンド

- `npm install` … パッケージのインストール（clone 直後に1回）
- `npm run dev` … 開発サーバー起動（http://localhost:3000）
- `npm run build` … 本番用ビルド（`dist/` に出力）

## 環境変数（.env）

Supabase の接続情報は `.env` で管理し、git には含めない（`.gitignore` 済み）。
Claude は `.env` を作成・閲覧しない（禁止事項を参照）。ユーザーが自分で作成する。必要な変数は次の2つ。

```
VITE_SUPABASE_URL=（Supabase の Project URL）
VITE_SUPABASE_PUBLISHABLE_KEY=（Supabase の Publishable key）
```

- 未設定のときは、画面に設定方法の案内を表示する（`src/main.jsx`）。
- 開発サーバーのポートは 3000（Supabase の Site URL の初期値 `http://localhost:3000` に合わせ、確認メールのリンクからアプリに戻れるようにしている）。

## ディレクトリ構成

```
eigo-app/
├── index.html                  # Vite のエントリーポイント
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                # 起動処理（.env 未設定時の案内もここ）
    ├── App.jsx                 # ルーティング（/login, /, /quiz/:stageId, /conversation/:conversationId）
    ├── index.css               # スタイル
    ├── contexts/
    │   └── AuthContext.jsx     # ログイン状態の共有（ログイン・会員登録・ログアウト）
    ├── components/
    │   ├── Header.jsx          # タイトルとログアウトボタン
    │   ├── ProtectedRoute.jsx  # 未ログインならログイン画面へリダイレクト
    │   ├── ChoiceList.jsx      # 3択の選択肢（クイズ・会話で共通）
    │   ├── Feedback.jsx        # 回答後の判定・カタカナ・解説
    │   └── Bubble.jsx          # 会話の吹き出し
    ├── pages/
    │   ├── LoginPage.jsx       # ログイン・会員登録フォーム
    │   ├── HomePage.jsx        # クイズ選択フォーム
    │   ├── QuizPage.jsx        # クイズ
    │   └── ConversationPage.jsx # 番外編・会話シミュレーション
    ├── lib/
    │   ├── supabaseClient.js   # Supabase の接続
    │   ├── progress.js         # 学習記録の保存・読み込み
    │   └── utils.js            # シャッフル・発音の読み上げ
    └── data/
        ├── questions.js        # クイズの問題データ（STAGES。choices の先頭が正解）
        └── conversations.js    # 会話データ（CONVERSATIONS。choices の先頭が一番よい返し）
```

- 番外編の会話シミュレーションはクイズのレベルとは独立しており、いつでも遊べる。
- 進捗（解放済みステージ数・最高点）は localStorage の `eigo-app-progress-<ユーザーID>` に、ユーザーごとに保存する。

ファイルが増えた場合は、この構成を更新すること。

## コーディング規約

### React / JavaScript
- 関数コンポーネントと Hooks で書く。コンポーネントのファイル名・関数名はパスカルケース（例: `QuizPage.jsx`）。
- `const` / `let` を使い、`var` は使わない。
- 変数・関数名はキャメルケース（例: `handleAnswer`）。
- 学習データの保存には `localStorage` を使う（読み書きは try/catch で囲む）。

### CSS
- クラス名はケバブケース（例: `.choice-button`）。
- 色やサイズなど繰り返し使う値は `:root` の CSS 変数で定義する。配色は淡いグリーン。
- スマートフォンでも使えるようレスポンシブに作る。

## 動作確認

- `npm run dev` で開発サーバーを起動し、http://localhost:3000 をブラウザで開いて確認する。
- コードを変更したら `npm run build` が通ることを確認する。

## クイズ・コンテンツの方針

- 出題する単語・フレーズは、受付、カウンセリング、施術中の声かけ、会計、お見送りなど、実際の接客場面で使うものにする。
- 英語は丁寧で自然な表現にする（例: "Please lie face down." / "Is the pressure okay?"）。
- 問題には日本語訳を付け、必要に応じて使う場面の説明も添える。
- UI の文言は日本語を基本とする。
- 英語の例文・単語データはスペルミスに注意する。

## 禁止事項

### 技術面
- 新しいフレームワーク・npm パッケージを指示なしに追加しない。
- `var` を使わない。
- `dangerouslySetInnerHTML` や `innerHTML` にユーザー入力や外部データを入れない。
- `eval()` や `new Function()` を使わない。
- API キーやパスワードなどの秘密情報をコードに書かない（`.env` から読み込む）。
- `.env` ファイル（`.env.local` などを含む）を読んだり、編集したり、内容を表示したりしない。
- 頼まれていないファイルを削除したり、大きく書き換えたりしない。

### コンテンツ面
- 性的な意味にとられかねない英語表現を使わない（施術・接客の場面にふさわしい表現に限る）。
- くだけすぎた表現やスラングを、正しい接客英語として載せない。
- 医療行為と誤解される表現（"treat"、"cure"、"diagnose" など）を、セラピストの言葉として使わない。
- 自信のない英訳や間違っているかもしれない英訳を、確認しないまま載せない。
