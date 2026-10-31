// import { defineConfig, loadEnv } from "vite";
// import react from "@vitejs/plugin-react";

// // Dev server chạy ở http://localhost:5173 và chuyển tiếp /api, /uploads sang BE.
// // => Trình duyệt chỉ nói chuyện với cùng một origin, nên KHÔNG dính lỗi CORS hay chứng chỉ HTTPS của .NET.
// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), "");
//   const target = env.VITE_PROXY_TARGET || "https://localhost:7000";

//   return {
//     plugins: [react()],
//     server: {
//       port: 5173,
//       proxy: {
//         "/api": { target, changeOrigin: true, secure: false },
//         "/uploads": { target, changeOrigin: true, secure: false },
//       },
//     },
//   };
// });

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Đọc địa chỉ của cả hai backend
  const httpTarget =
    env.VITE_PROXY_TARGET_HTTP || "http://localhost:5059";

  const httpsTarget =
    env.VITE_PROXY_TARGET_HTTPS || "https://localhost:7258";

  // Chọn backend theo biến môi trường
  const target =
    env.VITE_PROXY_PROTOCOL?.toLowerCase() === "https"
      ? httpsTarget
      : httpTarget;

  return {
    plugins: [react()],
    server: {
      host: "localhost",
      port: 5173,
      allowedHosts: ["jasmine-conform-envision.ngrok-free.dev"],
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
