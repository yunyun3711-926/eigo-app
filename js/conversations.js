// 番外編：会話シミュレーションのデータ
// クイズのレベルとは関係なく、いつでも遊べる
// turns の customer がお客様のセリフ、choices がセラピストの返答（先頭が一番よい返し）
// ending は最後にお客様が言うセリフ
const CONVERSATIONS = [
  {
    id: "first-visit",
    title: "はじめてのお客様をお迎え",
    icon: "👋",
    description: "受付での雑談で緊張をほぐそう",
    turns: [
      {
        customer: "Hi, I have a reservation at 3 o'clock.",
        ja: "こんにちは、3時に予約しています。",
        choices: [
          { en: "Thank you for coming. May I have your name, please?", kana: "サンキュー フォー カミング。メイ アイ ハヴ ユア ネーム、プリーズ？" },
          { en: "Yes, it's 3 o'clock now.", kana: "イエス、イッツ スリー オクロック ナウ。" },
          { en: "Sorry, we're closed at 3 o'clock.", kana: "ソーリー、ウィア クローズド アット スリー オクロック。" }
        ],
        explanation: "まず来店のお礼を伝えてから、名前を確認しましょう。\"Thank you for coming.\" は「ご来店ありがとうございます」で、お迎えのひと言にぴったりです。"
      },
      {
        customer: "It's Emma Brown.",
        ja: "エマ・ブラウンです。",
        choices: [
          { en: "Thank you, Ms. Brown. Please have a seat here.", kana: "サンキュー、ミズ ブラウン。プリーズ ハヴ ア スィート ヒア。" },
          { en: "Thank you, Brown. Sit.", kana: "サンキュー、ブラウン。スィット。" },
          { en: "Nice to meet you. Goodbye.", kana: "ナイス トゥ ミート ユー。グッバイ。" }
        ],
        explanation: "名字で呼ぶときは \"Ms.\"（ミズ・女性）や \"Mr.\"（ミスター・男性）をつけます。\"Sit.\" だけだと命令になってしまうので、\"Please have a seat.\" と丁寧に案内しましょう。"
      },
      {
        customer: "This place looks so relaxing. I've been walking all day!",
        ja: "ここ、すごく落ち着きますね。一日中歩いていたんです！",
        choices: [
          { en: "Oh, you must be tired. Where did you go today?", kana: "オー、ユー マスト ビー タイアード。ウェア ディジュー ゴー トゥデイ？" },
          { en: "Yes. Please fill out this form.", kana: "イエス。プリーズ フィル アウト ディス フォーム。" },
          { en: "Walking is bad for your health.", kana: "ウォーキング イズ バッド フォー ユア ヘルス。" }
        ],
        explanation: "\"You must be tired.\" は「お疲れでしょう」という共感のひと言です。そのあと質問を続けると会話が広がります。問診票の案内は間違いではありませんが、会話がそこで止まってしまいます。"
      },
      {
        customer: "I went to Asakusa and Tokyo Skytree. It was amazing!",
        ja: "浅草と東京スカイツリーに行きました。最高でした！",
        choices: [
          { en: "That sounds wonderful! Today's massage will help your legs feel lighter.", kana: "ザット サウンズ ワンダフル！トゥデイズ マッサージ ウィル ヘルプ ユア レッグズ フィール ライター。" },
          { en: "I have never been there.", kana: "アイ ハヴ ネヴァー ビーン ゼア。" },
          { en: "Skytree is very expensive.", kana: "スカイツリー イズ ヴェリー イクスペンスィヴ。" }
        ],
        explanation: "\"That sounds wonderful!\" は相手の話に明るく反応する定番の表現です。そこから今日のマッサージの話につなげると、自然に施術へ案内できます。"
      },
      {
        customer: "Great, I can't wait!",
        ja: "いいですね、楽しみです！",
        choices: [
          { en: "We'll be ready in a moment. Please wait here.", kana: "ウィール ビー レディ イン ア モーメント。プリーズ ウェイト ヒア。" },
          { en: "Please wait for one hour.", kana: "プリーズ ウェイト フォー ワン アワー。" },
          { en: "Me too! I can't wait to go home.", kana: "ミー トゥー！アイ キャント ウェイト トゥ ゴー ホーム。" }
        ],
        explanation: "\"in a moment\" は「すぐに」。\"I can't wait!\" は「待ちきれない＝楽しみ！」という意味なので、気持ちよく応えてあげましょう。"
      }
    ],
    ending: { customer: "Thank you! This is going to be great.", ja: "ありがとう！楽しみだわ。" }
  },
  {
    id: "during-session",
    title: "施術中のコミュニケーション",
    icon: "💆",
    description: "お客様の要望にやさしく応えよう",
    turns: [
      {
        customer: "Ooh, my shoulders are really stiff.",
        ja: "うーん、肩がすごくこっているんです。",
        choices: [
          { en: "I see. I'll spend some extra time on your shoulders.", kana: "アイ スィー。アイル スペンド サム エクストラ タイム オン ユア ショルダーズ。" },
          { en: "Your shoulders are very big.", kana: "ユア ショルダーズ アー ヴェリー ビッグ。" },
          { en: "Stiff? Please see a doctor.", kana: "スティフ？プリーズ スィー ア ドクター。" }
        ],
        explanation: "「こり」は \"stiff\"（スティフ）と言います。\"spend extra time on ~\" は「〜に時間をかけて重点的にやる」。要望を受け止めたことが伝わる返し方です。"
      },
      {
        customer: "Ouch! That's a little too strong.",
        ja: "いたっ！ちょっと強すぎます。",
        choices: [
          { en: "I'm sorry. I'll use lighter pressure.", kana: "アイム ソーリー。アイル ユーズ ライター プレッシャー。" },
          { en: "No pain, no gain!", kana: "ノー ペイン、ノー ゲイン！" },
          { en: "Thank you very much!", kana: "サンキュー ヴェリー マッチ！" }
        ],
        explanation: "まず \"I'm sorry.\" と謝ってから、すぐに弱めることを伝えます。\"No pain, no gain!\"（痛みなくして得るものなし）は、お客様に我慢を強いるのでサロンでは使いません。"
      },
      {
        customer: "Ah, that's much better. That feels nice.",
        ja: "ああ、だいぶ楽になりました。気持ちいいです。",
        choices: [
          { en: "I'm glad to hear that. Please let me know anytime.", kana: "アイム グラッド トゥ ヒア ザット。プリーズ レット ミー ノウ エニータイム。" },
          { en: "Are you sure? It's the same.", kana: "アー ユー シュア？イッツ ザ セイム。" },
          { en: "Nice to meet you too.", kana: "ナイス トゥ ミート ユー トゥー。" }
        ],
        explanation: "\"I'm glad to hear that.\" は「それはよかったです」。\"Please let me know anytime.\" と添えると、また何かあれば言っていいんだとお客様が安心できます。"
      },
      {
        customer: "Could I get another towel? I'm a little cold.",
        ja: "タオルをもう1枚もらえますか？少し寒くて。",
        choices: [
          { en: "Of course. Here's an extra towel for you.", kana: "オフ コース。ヒアズ アン エクストラ タオル フォー ユー。" },
          { en: "Sorry, towels are for sale.", kana: "ソーリー、タオルズ アー フォー セール。" },
          { en: "Cold? It's summer now.", kana: "コールド？イッツ サマー ナウ。" }
        ],
        explanation: "\"Of course.\" は「もちろんです」と快く引き受けるひと言です。\"extra\" は「追加の」。お客様の感じ方を否定せず、すぐに対応しましょう。"
      },
      {
        customer: "Thank you. You're very kind.",
        ja: "ありがとう。とても親切ですね。",
        choices: [
          { en: "My pleasure. Just relax and enjoy.", kana: "マイ プレジャー。ジャスト リラックス アンド エンジョイ。" },
          { en: "Yes, I know.", kana: "イエス、アイ ノウ。" },
          { en: "You're welcome. Please wake up.", kana: "ユア ウェルカム。プリーズ ウェイク アップ。" }
        ],
        explanation: "\"My pleasure.\" は「どういたしまして（喜んで）」の丁寧な言い方で、接客にぴったりです。\"Yes, I know.\" だと「知ってます」と自慢しているように聞こえてしまいます。"
      }
    ],
    ending: { customer: "Mmm, this is so relaxing...", ja: "うーん、すごくリラックスできる…" }
  },
  {
    id: "recommendation",
    title: "お見送りでおすすめを聞かれる",
    icon: "☕",
    description: "施術後の雑談とご案内",
    turns: [
      {
        customer: "That was the best massage I've ever had!",
        ja: "今までで最高のマッサージでした！",
        choices: [
          { en: "Thank you so much! I'm happy you enjoyed it.", kana: "サンキュー ソー マッチ！アイム ハッピー ユー エンジョイド イット。" },
          { en: "Really? I'm not sure.", kana: "リアリー？アイム ノット シュア。" },
          { en: "Yes, I'm the best in Japan.", kana: "イエス、アイム ザ ベスト イン ジャパン。" }
        ],
        explanation: "日本では謙遜しがちですが、英語ではほめられたら素直に \"Thank you!\" と受け取るのが自然です。\"I'm not sure.\" と返すと、相手の感想を否定しているように聞こえます。"
      },
      {
        customer: "By the way, do you know any good places to eat around here?",
        ja: "ところで、この辺でおいしいお店を知っていますか？",
        choices: [
          { en: "Yes! There's a great ramen shop just around the corner.", kana: "イエス！ゼアズ ア グレイト ラーメン ショップ ジャスト アラウンド ザ コーナー。" },
          { en: "Sorry, I don't eat.", kana: "ソーリー、アイ ドント イート。" },
          { en: "Yes, please eat here.", kana: "イエス、プリーズ イート ヒア。" }
        ],
        explanation: "\"There's ~\" は「〜がありますよ」と紹介するときの形です。\"just around the corner\" は「すぐそこの角に」で、近いことを伝える便利な表現です。"
      },
      {
        customer: "Ramen sounds perfect! How do I get there?",
        ja: "ラーメン、いいですね！どうやって行けばいいですか？",
        choices: [
          { en: "Turn left out of the door and walk for two minutes. It's on your right.", kana: "ターン レフト アウト オヴ ザ ドア アンド ウォーク フォー トゥー ミニッツ。イッツ オン ユア ライト。" },
          { en: "Take a plane.", kana: "テイク ア プレイン。" },
          { en: "I don't know. Good luck!", kana: "アイ ドント ノウ。グッド ラック！" }
        ],
        explanation: "道案内は「方向（turn left / right）」「時間（walk for ~ minutes）」「目印（on your right）」の3つで伝わります。地図アプリの画面を一緒に見せるとさらに安心です。"
      },
      {
        customer: "Thanks! Oh, can I come back again before I leave Japan?",
        ja: "ありがとう！そうだ、帰国前にもう一度来られますか？",
        choices: [
          { en: "Of course! Would you like to book your next visit now?", kana: "オフ コース！ウッジュー ライク トゥ ブック ユア ネクスト ヴィジット ナウ？" },
          { en: "Japan is a beautiful country.", kana: "ジャパン イズ ア ビューティフル カントリー。" },
          { en: "No, you can't.", kana: "ノー、ユー キャント。" }
        ],
        explanation: "再来店の希望は大チャンスです。\"Of course!\" と歓迎してから、その場で次回の予約を提案しましょう。クイズで習った \"book your next visit\" がここで使えます。"
      },
      {
        customer: "Yes, how about Friday afternoon?",
        ja: "ええ、金曜日の午後はどうですか？",
        choices: [
          { en: "Friday at 2 p.m. is available. Shall I book it for you?", kana: "フライデイ アット トゥー ピーエム イズ アヴェイラブル。シャル アイ ブック イット フォー ユー？" },
          { en: "Friday is a good day for ramen.", kana: "フライデイ イズ ア グッド デイ フォー ラーメン。" },
          { en: "Afternoon tea is nice.", kana: "アフタヌーン ティー イズ ナイス。" }
        ],
        explanation: "\"available\"（アヴェイラブル）は「空いている・予約可能な」。\"Shall I ~?\" は「〜しましょうか？」と申し出る丁寧な表現です。具体的な時間を伝えると話がスムーズに進みます。"
      }
    ],
    ending: { customer: "Perfect! See you on Friday!", ja: "完璧！じゃあ金曜日にね！" }
  }
];
