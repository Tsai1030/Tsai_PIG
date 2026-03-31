import axios from "axios";

const api = axios.create({
  baseURL: "",  // 使用相對路徑，走 Next.js rewrites proxy 轉發到後端
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 讓瀏覽器自動帶上 httpOnly Cookie
});

// Response interceptor — 401 導向登入頁
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
