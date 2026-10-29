import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// ログイン状態をアプリ全体で共有するための仕組み
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // 起動直後、保存済みのログイン状態を確認し終わるまでは true
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ブラウザに保存されているログイン状態を取得する
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // ログイン・ログアウトなどで状態が変わったら反映する
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    // 確認メールのリンクを開いたら、このアプリに戻ってくるようにする
    signUp: (email, password) =>
      supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin }
      }),
    signOut: () => supabase.auth.signOut()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
