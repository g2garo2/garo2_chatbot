import axios from "axios";

function resolveApiBaseUrl() {
  const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (!rawBaseUrl) {
    return "";
  }

  // Guard against misconfigured env values like "url1,url2".
  const [firstBaseUrl] = rawBaseUrl
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return firstBaseUrl?.replace(/\/+$/, "") || "";
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
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

export const meApi = {
  getUsage: async () => {
    const { data } = await api.get("/me/usage");
    return data;
  },
  getSubscription: async () => {
    const { data } = await api.get("/me/subscription");
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

export const translateApi = {
  translate: async (payload) => {
    const { data } = await api.post("/translate", payload);
    return data;
  },
};

export const billingApi = {
  createOrder: async (payload) => {
    const { data } = await api.post("/create-order", payload);
    return data;
  },
  verifyPayment: async (payload) => {
    const { data } = await api.post("/verify-payment", payload);
    return data;
  },
  createSubscription: async (plan) => {
    const { data } = await api.post("/billing/create-subscription", { plan });
    return data;
  },
  verifySubscription: async (payload) => {
    const { data } = await api.post("/billing/verify-subscription", payload);
    return data;
  },
};

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export default api;
