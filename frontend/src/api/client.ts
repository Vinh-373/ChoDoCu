import axios from "axios";

export const TOKEN_KEY = "chodocu.token";
export const USER_KEY = "chodocu.user";
export const AUTH_EXPIRED_EVENT = "chodocu:auth-expired";

// Dev: để trống → dùng "/api" và Vite proxy chuyển sang BE. Deploy: đặt VITE_API_URL.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Lỗi riêng: BE trả về HTML thay vì JSON (thường do proxy chưa cấu hình hoặc sai cổng). */
export class WrongBackendError extends Error {
  constructor() {
    super(
      "Máy chủ trả về trang web thay vì dữ liệu API. Hãy chạy BE, kiểm tra VITE_PROXY_TARGET trong .env, rồi khởi động lại npm run dev.",
    );
    this.name = "WrongBackendError";
  }
}

client.interceptors.response.use(
  (res) => {
    const type = String(res.headers["content-type"] ?? "");
    if (type.includes("text/html") || (typeof res.data === "string" && res.data.trimStart().startsWith("<"))) {
      return Promise.reject(new WrongBackendError());
    }
    return res;
  },
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";
    // 401 ở trang đăng nhập/đăng ký là sai mật khẩu, không phải hết phiên.
    if (status === 401 && localStorage.getItem(TOKEN_KEY) && !url.includes("/auth/")) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export default client;
