import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Supabase のエラーメッセージ（英語）を日本語にする
function toJapaneseError(message) {
  if (message.includes("Invalid login credentials")) {
    return "メールアドレスまたはパスワードが違います。";
  }
  if (message.includes("Email not confirmed")) {
    return "メールアドレスの確認がまだです。届いたメールのリンクを開いてください。";
  }
  if (message.includes("User already registered")) {
    return "このメールアドレスはすでに登録されています。ログインしてください。";
  }
  if (message.includes("Password should be at least")) {
    return "パスワードは6文字以上にしてください。";
  }
  if (message.includes("rate limit")) {
    return "短時間に何度も送信されました。しばらく待ってからお試しください。";
  }
  return `エラーが発生しました（${message}）`;
}

export default function LoginPage() {
  const { session, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // "login"（ログイン）か "signup"（会員登録）
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ログイン後は、もともと開こうとしていたページ（なければトップ）へ移動する
  const redirectTo = location.state?.from ?? "/";

  if (session) {
    return <Navigate to={redirectTo} replace />;
  }

  const isSignUp = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setSubmitting(true);

    const { data, error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setSubmitting(false);

    if (error) {
      setErrorMessage(toJapaneseError(error.message));
      return;
    }

    // メール確認が必要な設定の場合、登録直後はまだログインできない
    if (isSignUp && !data.session) {
      setInfoMessage("確認メールを送信しました。メール内のリンクを開いてから、ログインしてください。");
      setMode("login");
      setPassword("");
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  function toggleMode() {
    setMode(isSignUp ? "login" : "signup");
    setErrorMessage("");
    setInfoMessage("");
  }

  return (
    <form className="simple-form" onSubmit={handleSubmit}>
      <h2 className="form-title">{isSignUp ? "会員登録" : "ログイン"}</h2>

      <label className="form-field">
        <span className="form-label">メールアドレス</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label className="form-field">
        <span className="form-label">パスワード{isSignUp && "（6文字以上）"}</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={6}
          required
        />
      </label>

      {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
      {infoMessage && <p className="info-message" role="status">{infoMessage}</p>}

      <button type="submit" className="primary-button" disabled={submitting}>
        {submitting ? "送信中…" : isSignUp ? "登録する" : "ログイン"}
      </button>

      <button type="button" className="text-button" onClick={toggleMode}>
        {isSignUp ? "アカウントをお持ちの方はこちら（ログイン）" : "はじめての方はこちら（会員登録）"}
      </button>
    </form>
  );
}
