// クイズの問題データ
// stages の順番がレベルの順番（全問正解で次のステージが解放される）
// choices の先頭が正解。表示時にシャッフルする
const STAGES = [
  {
    id: "reception",
    title: "受付・カウンセリング",
    icon: "🌿",
    description: "お出迎えから問診まで",
    questions: [
      {
        ja: "いらっしゃいませ。ご予約はされていますか？",
        choices: [
          { en: "Welcome. Do you have a reservation?", kana: "ウェルカム。ドゥー ユー ハヴ ア レザベーション？" },
          { en: "Welcome. Did you book a table?", kana: "ウェルカム。ディジュー ブック ア テーブル？" },
          { en: "Welcome. Do you have a ticket?", kana: "ウェルカム。ドゥー ユー ハヴ ア ティケット？" }
        ],
        explanation: "予約の有無は \"Do you have a reservation?\" と聞くのが定番です。\"book a table\" はレストランの席の予約なので、サロンでは使いません。"
      },
      {
        ja: "お名前をお伺いしてもよろしいですか？",
        choices: [
          { en: "May I have your name, please?", kana: "メイ アイ ハヴ ユア ネーム、プリーズ？" },
          { en: "May I have your number, please?", kana: "メイ アイ ハヴ ユア ナンバー、プリーズ？" },
          { en: "Could you sign your name here?", kana: "クッジュー サイン ユア ネーム ヒア？" }
        ],
        explanation: "\"May I have ~?\" は「〜をいただけますか」という丁寧な言い方です。\"What's your name?\" は少し直接的なので、接客では \"May I have your name?\" が安心です。"
      },
      {
        ja: "こちらの問診票にご記入ください。",
        choices: [
          { en: "Please fill out this form.", kana: "プリーズ フィル アウト ディス フォーム。" },
          { en: "Please read this book.", kana: "プリーズ リード ディス ブック。" },
          { en: "Please take this form home.", kana: "プリーズ テイク ディス フォーム ホーム。" }
        ],
        explanation: "「記入する」は \"fill out\" です。問診票は \"form\" や \"questionnaire\"（クエスチョネア）と言います。"
      },
      {
        ja: "本日はどのマッサージになさいますか？",
        choices: [
          { en: "Which massage would you like today?", kana: "ウィッチ マッサージ ウッジュー ライク トゥデイ？" },
          { en: "Which room would you like today?", kana: "ウィッチ ルーム ウッジュー ライク トゥデイ？" },
          { en: "How long did you wait today?", kana: "ハウ ロング ディジュー ウェイト トゥデイ？" }
        ],
        explanation: "\"Which ~ would you like?\" は「どの〜になさいますか」と選んでもらうときの丁寧な表現です。メニュー表を見せながら言うと伝わりやすくなります。"
      },
      {
        ja: "特に気になるところはありますか？",
        choices: [
          { en: "Are there any areas you'd like me to focus on?", kana: "アー ゼア エニー エリアズ ユード ライク ミー トゥ フォーカス オン？" },
          { en: "Are there any places you'd like to visit?", kana: "アー ゼア エニー プレイスィズ ユード ライク トゥ ヴィジット？" },
          { en: "Do you have any questions about the price?", kana: "ドゥー ユー ハヴ エニー クエスチョンズ アバウト ザ プライス？" }
        ],
        explanation: "「重点的にほぐしてほしい部位」を聞く表現です。\"areas\"（エリアズ）は体の部位のこと。肩なら \"shoulders\"（ショルダーズ）、腰なら \"lower back\"（ロウワー バック）と返ってくることが多いです。"
      },
      {
        ja: "強めと弱め、どちらの力加減がお好みですか？",
        choices: [
          { en: "Do you prefer firm or light pressure?", kana: "ドゥー ユー プリファー ファーム オア ライト プレッシャー？" },
          { en: "Do you prefer hot or cold water?", kana: "ドゥー ユー プリファー ホット オア コールド ウォーター？" },
          { en: "Do you prefer a window or aisle seat?", kana: "ドゥー ユー プリファー ア ウィンドウ オア アイル シート？" }
        ],
        explanation: "力加減は \"pressure\"（プレッシャー）です。強めは \"firm\"（ファーム）、弱めは \"light\"（ライト）。\"strong\" も通じますが、\"firm\" のほうがサロンらしい表現です。"
      },
      {
        ja: "アレルギーはありますか？",
        choices: [
          { en: "Do you have any allergies?", kana: "ドゥー ユー ハヴ エニー アラジーズ？" },
          { en: "Do you have any coupons?", kana: "ドゥー ユー ハヴ エニー クーポンズ？" },
          { en: "Do you have any plans today?", kana: "ドゥー ユー ハヴ エニー プランズ トゥデイ？" }
        ],
        explanation: "\"allergy\" は英語では「アラジー」と発音します。「アレルギー」では通じにくいので注意しましょう。オイルを使う前に必ず確認したい質問です。"
      },
      {
        ja: "最近、ケガや手術をされましたか？",
        choices: [
          { en: "Have you had any injuries or surgery recently?", kana: "ハヴ ユー ハッド エニー インジュリーズ オア サージャリー リースントリー？" },
          { en: "Have you been to Japan before?", kana: "ハヴ ユー ビーン トゥ ジャパン ビフォー？" },
          { en: "Have you changed your hotel recently?", kana: "ハヴ ユー チェインジド ユア ホテル リースントリー？" }
        ],
        explanation: "ケガは \"injury\"（インジュリー）、手術は \"surgery\"（サージャリー）です。安全に施術するための大切な確認なので、覚えておきましょう。"
      },
      {
        ja: "こちらでお着替えください。",
        choices: [
          { en: "You can change your clothes here.", kana: "ユー キャン チェインジ ユア クローズ ヒア。" },
          { en: "You can exchange money here.", kana: "ユー キャン イクスチェインジ マニー ヒア。" },
          { en: "You can charge your phone here.", kana: "ユー キャン チャージ ユア フォン ヒア。" }
        ],
        explanation: "\"change your clothes\" で「着替える」です。\"exchange money\" は「両替」なので別の意味になります。着替えを渡すときは \"Here are your clothes.\" と添えると親切です。"
      },
      {
        ja: "お荷物はこちらのカゴに入れてください。",
        choices: [
          { en: "Please put your belongings in this basket.", kana: "プリーズ プット ユア ビロンギングズ イン ディス バスケット。" },
          { en: "Please put your name on this basket.", kana: "プリーズ プット ユア ネーム オン ディス バスケット。" },
          { en: "Please put this basket on the bed.", kana: "プリーズ プット ディス バスケット オン ザ ベッド。" }
        ],
        explanation: "「持ち物・荷物」は \"belongings\"（ビロンギングズ）です。貴重品は \"valuables\"（ヴァリュアブルズ）と言います。"
      }
    ]
  },
  {
    id: "session",
    title: "施術中",
    icon: "💆",
    description: "体勢の案内や声かけ",
    questions: [
      {
        ja: "うつ伏せになってください。",
        choices: [
          { en: "Please lie face down.", kana: "プリーズ ライ フェイス ダウン。" },
          { en: "Please lie face up.", kana: "プリーズ ライ フェイス アップ。" },
          { en: "Please sit up.", kana: "プリーズ スィット アップ。" }
        ],
        explanation: "\"face down\"（顔を下に）でうつ伏せです。\"lie\"（ライ）は「横になる」。ベッドを手で示しながら言うとより伝わります。"
      },
      {
        ja: "仰向けになってください。",
        choices: [
          { en: "Please turn over and lie face up.", kana: "プリーズ ターン オーヴァー アンド ライ フェイス アップ。" },
          { en: "Please turn around and stand up.", kana: "プリーズ ターン アラウンド アンド スタンド アップ。" },
          { en: "Please turn off the light.", kana: "プリーズ ターン オフ ザ ライト。" }
        ],
        explanation: "\"turn over\" は「寝返りを打つ・ひっくり返る」、\"face up\" は「顔を上に」で仰向けです。うつ伏せ（face down）とセットで覚えましょう。"
      },
      {
        ja: "力加減はいかがですか？",
        choices: [
          { en: "How is the pressure?", kana: "ハウ イズ ザ プレッシャー？" },
          { en: "How is the weather?", kana: "ハウ イズ ザ ウェザー？" },
          { en: "How is your hotel?", kana: "ハウ イズ ユア ホテル？" }
        ],
        explanation: "施術中に一番よく使うフレーズです。\"Is the pressure okay?\"（イズ ザ プレッシャー オーケー？）でも同じ意味になります。"
      },
      {
        ja: "痛かったら教えてください。",
        choices: [
          { en: "Please let me know if it hurts.", kana: "プリーズ レット ミー ノウ イフ イット ハーツ。" },
          { en: "Please let me know if it rains.", kana: "プリーズ レット ミー ノウ イフ イット レインズ。" },
          { en: "Please let me know your address.", kana: "プリーズ レット ミー ノウ ユア アドレス。" }
        ],
        explanation: "\"let me know\" は「教えてください」、\"hurt\"（ハート）は「痛む」です。施術の最初に伝えておくと、お客様が安心できます。"
      },
      {
        ja: "寒くないですか？",
        choices: [
          { en: "Are you warm enough?", kana: "アー ユー ウォーム イナフ？" },
          { en: "Are you hungry?", kana: "アー ユー ハングリー？" },
          { en: "Are you ready to go?", kana: "アー ユー レディ トゥ ゴー？" }
        ],
        explanation: "日本語をそのまま訳した \"Aren't you cold?\" は、Yes と No のどちらで答えればいいか迷わせてしまいます。\"Are you warm enough?\"（十分暖かいですか）と聞くと答えやすくなります。"
      },
      {
        ja: "タオルをお掛けしますね。",
        choices: [
          { en: "I'll put a towel over you.", kana: "アイル プット ア タオル オーヴァー ユー。" },
          { en: "I'll put a towel in the bag.", kana: "アイル プット ア タオル イン ザ バッグ。" },
          { en: "I'll wash the towel now.", kana: "アイル ウォッシュ ザ タオル ナウ。" }
        ],
        explanation: "\"over you\" で「あなたの上に」。体に触れる前や何かをする前に、こうしてひと言伝えるとお客様が安心します。"
      },
      {
        ja: "腕の力を抜いてください。",
        choices: [
          { en: "Please relax your arms.", kana: "プリーズ リラックス ユア アームズ。" },
          { en: "Please raise your arms.", kana: "プリーズ レイズ ユア アームズ。" },
          { en: "Please cross your arms.", kana: "プリーズ クロス ユア アームズ。" }
        ],
        explanation: "「力を抜く」は \"relax\" です。\"raise\"（レイズ・上げる）と音が似ているので、聞き間違えに注意しましょう。"
      },
      {
        ja: "少し強めにしますね。",
        choices: [
          { en: "I'll use a little more pressure.", kana: "アイル ユーズ ア リトル モア プレッシャー。" },
          { en: "I'll use a little less pressure.", kana: "アイル ユーズ ア リトル レス プレッシャー。" },
          { en: "I'll use a little more oil.", kana: "アイル ユーズ ア リトル モア オイル。" }
        ],
        explanation: "\"more\" で強め、\"less\"（レス）で弱めです。\"more\" と \"less\" を入れ替えるだけで、両方の場面に使えます。"
      },
      {
        ja: "深呼吸してください。",
        choices: [
          { en: "Please take a deep breath.", kana: "プリーズ テイク ア ディープ ブレス。" },
          { en: "Please hold your breath.", kana: "プリーズ ホールド ユア ブレス。" },
          { en: "Please take a deep sleep.", kana: "プリーズ テイク ア ディープ スリープ。" }
        ],
        explanation: "\"take a deep breath\" で「深呼吸する」です。\"hold your breath\" は「息を止める」なので逆の意味になります。"
      },
      {
        ja: "終わりました。ゆっくり起き上がってください。",
        choices: [
          { en: "We're all done. Please sit up slowly.", kana: "ウィア オール ダン。プリーズ スィット アップ スロウリー。" },
          { en: "We're all done. Please stand up quickly.", kana: "ウィア オール ダン。プリーズ スタンド アップ クイックリー。" },
          { en: "We're all done. Please lie down slowly.", kana: "ウィア オール ダン。プリーズ ライ ダウン スロウリー。" }
        ],
        explanation: "\"We're all done.\" は「すべて終わりました」。施術後は急に立つとふらつくことがあるので、\"slowly\"（ゆっくり）と添えましょう。"
      }
    ]
  },
  {
    id: "checkout",
    title: "お会計・お見送り",
    icon: "🌸",
    description: "お支払いからお見送りまで",
    questions: [
      {
        ja: "いかがでしたか？",
        choices: [
          { en: "How was everything?", kana: "ハウ ワズ エヴリシング？" },
          { en: "How much was everything?", kana: "ハウ マッチ ワズ エヴリシング？" },
          { en: "Where was everything?", kana: "ウェア ワズ エヴリシング？" }
        ],
        explanation: "施術後に感想を聞く定番の表現です。\"How much\" にすると「全部でいくらでしたか」という値段の質問になってしまいます。"
      },
      {
        ja: "お水をどうぞ。",
        choices: [
          { en: "Here's some water for you.", kana: "ヒアズ サム ウォーター フォー ユー。" },
          { en: "Please wash with water.", kana: "プリーズ ウォッシュ ウィズ ウォーター。" },
          { en: "Here's some wine for you.", kana: "ヒアズ サム ワイン フォー ユー。" }
        ],
        explanation: "\"Here's ~ for you.\" は物を手渡すときの便利な表現です。お茶なら \"Here's some tea for you.\" になります。"
      },
      {
        ja: "お会計は8,000円です。",
        choices: [
          { en: "That will be 8,000 yen.", kana: "ザット ウィル ビー エイト サウザンド イェン。" },
          { en: "That will be 800 yen.", kana: "ザット ウィル ビー エイト ハンドレッド イェン。" },
          { en: "You will get 8,000 yen.", kana: "ユー ウィル ゲット エイト サウザンド イェン。" }
        ],
        explanation: "\"That will be ~.\" は金額を伝える決まり文句です。1,000 は \"thousand\"（サウザンド）、100 は \"hundred\"（ハンドレッド）。金額は聞き間違えやすいので、レジの画面を見せると確実です。"
      },
      {
        ja: "お支払いは現金ですか、カードですか？",
        choices: [
          { en: "Will you be paying by cash or card?", kana: "ウィル ユー ビー ペイイング バイ キャッシュ オア カード？" },
          { en: "Would you like a bag or a box?", kana: "ウッジュー ライク ア バッグ オア ア ボックス？" },
          { en: "Will you be coming by bus or train?", kana: "ウィル ユー ビー カミング バイ バス オア トレイン？" }
        ],
        explanation: "支払い方法は \"pay by ~\" で表します。短く \"Cash or card?\" と聞いても通じます。"
      },
      {
        ja: "こちらにサインをお願いします。",
        choices: [
          { en: "Please sign here.", kana: "プリーズ サイン ヒア。" },
          { en: "Please sing here.", kana: "プリーズ スィング ヒア。" },
          { en: "Please sit here.", kana: "プリーズ スィット ヒア。" }
        ],
        explanation: "\"sign\"（サイン）は「署名する」、\"sing\"（スィング）は「歌う」です。つづりが似ているので気をつけましょう。"
      },
      {
        ja: "レシートはご利用ですか？",
        choices: [
          { en: "Would you like a receipt?", kana: "ウッジュー ライク ア リスィート？" },
          { en: "Would you like a recipe?", kana: "ウッジュー ライク ア レスィピ？" },
          { en: "Would you like a refund?", kana: "ウッジュー ライク ア リファンド？" }
        ],
        explanation: "\"receipt\" は p を発音せず「リスィート」と読みます。\"recipe\"（レスィピ）は料理のレシピ、\"refund\" は返金です。"
      },
      {
        ja: "お忘れ物はありませんか？",
        choices: [
          { en: "Do you have all your belongings?", kana: "ドゥー ユー ハヴ オール ユア ビロンギングズ？" },
          { en: "Did you forget my name?", kana: "ディジュー フォゲット マイ ネーム？" },
          { en: "Do you have all your tickets?", kana: "ドゥー ユー ハヴ オール ユア ティケッツ？" }
        ],
        explanation: "「持ち物は全部お持ちですか」という言い方で、忘れ物を確認します。受付で習った \"belongings\" がここでも使えます。"
      },
      {
        ja: "今日はお水を多めに飲んでください。",
        choices: [
          { en: "Please drink plenty of water today.", kana: "プリーズ ドリンク プレンティ オヴ ウォーター トゥデイ。" },
          { en: "Please drink plenty of beer today.", kana: "プリーズ ドリンク プレンティ オヴ ビア トゥデイ。" },
          { en: "Please eat plenty of food today.", kana: "プリーズ イート プレンティ オヴ フード トゥデイ。" }
        ],
        explanation: "\"plenty of ~\" は「たっぷりの〜」です。施術後のアドバイスとして、お見送りの前に伝えましょう。"
      },
      {
        ja: "次回のご予約はいかがですか？",
        choices: [
          { en: "Would you like to book your next visit?", kana: "ウッジュー ライク トゥ ブック ユア ネクスト ヴィジット？" },
          { en: "Would you like to cancel your next visit?", kana: "ウッジュー ライク トゥ キャンセル ユア ネクスト ヴィジット？" },
          { en: "Would you like to book a taxi?", kana: "ウッジュー ライク トゥ ブック ア タクスィー？" }
        ],
        explanation: "\"book\" は動詞で「予約する」です。\"next visit\" は「次回のご来店」。旅行中のお客様には \"Will you be in town for a while?\"（しばらく滞在されますか）と聞くのもよいでしょう。"
      },
      {
        ja: "ありがとうございました。お気をつけて。",
        choices: [
          { en: "Thank you very much. Have a nice day!", kana: "サンキュー ヴェリー マッチ。ハヴ ア ナイス デイ！" },
          { en: "Thank you very much. Watch out!", kana: "サンキュー ヴェリー マッチ。ウォッチ アウト！" },
          { en: "Thank you very much. See you never!", kana: "サンキュー ヴェリー マッチ。スィー ユー ネヴァー！" }
        ],
        explanation: "日本語の「お気をつけて」は、英語では \"Have a nice day!\" や \"Take care!\"（テイク ケア）が自然です。\"Watch out!\" は「危ない！」という警告になってしまいます。"
      }
    ]
  }
];
