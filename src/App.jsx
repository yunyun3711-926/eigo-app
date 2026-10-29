import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import ConversationPage from "./pages/ConversationPage";

export default function App() {
  return (
    <>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* ここから下はログインが必要なページ */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/quiz/:stageId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route
            path="/conversation/:conversationId"
            element={<ProtectedRoute><ConversationPage /></ProtectedRoute>}
          />
          {/* 存在しない URL はトップへ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
