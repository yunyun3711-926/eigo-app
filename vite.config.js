import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Supabase の Site URL の初期値（http://localhost:3000）に合わせる
    // 確認メールのリンクを開いたとき、このアプリに戻ってこられるようにするため
    port: 3000
  }
});
