import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// ログインが必要なページを包むコンポーネント
// 未ログインならログイン画面へリダイレクトし、ログイン後に元のページへ戻れるようにする
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="loading">読み込み中…</p>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
