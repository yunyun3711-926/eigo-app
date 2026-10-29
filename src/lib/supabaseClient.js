import { createClient } from "@supabase/supabase-js";

// Supabase の接続情報は .env から読み込む
// Vite では VITE_ で始まる環境変数だけがブラウザ側のコードに渡される
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// .env が未設定のときは、画面に設定方法を表示するために使う
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;
