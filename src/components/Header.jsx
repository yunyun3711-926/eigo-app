import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="app-header">
      <h1 className="app-title">セラピスト英語クイズ</h1>
      <p className="app-subtitle">接客で使える英語を、クイズで身につけよう</p>
      {user && (
        <div className="header-user">
          <span className="header-email">{user.email}</span>
          <button type="button" className="logout-button" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      )}
    </header>
  );
}
