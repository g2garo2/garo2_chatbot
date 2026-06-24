import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("garo2_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  googleLogin: async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

export const chatApi = {
  newChat: async () => {
    const { data } = await api.post("/chat/new", {});
    return data;
  },
  getHistory: async () => {
    const { data } = await api.get("/chat/history");
    return data;
  },
  getChat: async (chatId) => {
    const { data } = await api.get(`/chat/${chatId}`);
    return data;
  },
  sendMessage: async (chatId, payload) => {
    const { data } = await api.post(`/chat/${chatId}/message`, payload);
    return data;
  },
  deleteChat: async (chatId) => {
    const { data } = await api.delete(`/chat/${chatId}`);
    return data;
  },
};

export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};

export default api;
