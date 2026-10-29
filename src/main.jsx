import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import "./index.css";

// .env が未設定のときに表示する案内
function ConfigError() {
  return (
    <main className="app-main">
      <div className="simple-form">
        <h2 className="form-title">設定が必要です</h2>
        <p className="error-message">
          プロジェクトのフォルダに .env ファイルを作り、VITE_SUPABASE_URL と
          VITE_SUPABASE_PUBLISHABLE_KEY を設定してから、開発サーバーを起動し直してください。
        </p>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isSupabaseConfigured ? (
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    ) : (
      <ConfigError />
    )}
  </React.StrictMode>
);
