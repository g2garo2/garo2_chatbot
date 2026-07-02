const NETWORK_ISSUE_EVENT = "garo2-network-issue";
const REQUEST_TIMEOUT_MS = 15000;

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

const API_BASE_URL = resolveApiBaseUrl();

function emitNetworkIssue() {
  window.dispatchEvent(new CustomEvent(NETWORK_ISSUE_EVENT));
}

function joinUrl(baseUrl, path) {
  if (!baseUrl) {
    return path;
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { detail: text } : null;
}

function createApiError({ message, code, response }) {
  return { message, code, response };
}

async function request(path, { method = "GET", body, headers = {}, signal } = {}) {
  const controller = signal ? null : new AbortController();
  const requestSignal = signal || controller.signal;
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    : null;

  try {
    const token = localStorage.getItem("garo2_token");
    const response = await fetch(joinUrl(API_BASE_URL, path), {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body == null ? undefined : JSON.stringify(body),
      signal: requestSignal,
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw createApiError({
        message: typeof data?.detail === "string" ? data.detail : `Request failed with status ${response.status}.`,
        response: {
          status: response.status,
          data,
        },
      });
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = createApiError({
        message: "Network Error",
        code: "ECONNABORTED",
      });
      emitNetworkIssue();
      throw timeoutError;
    }

    if (!error?.response) {
      const networkError = createApiError({
        message: error?.message || "Network Error",
      });
      emitNetworkIssue();
      throw networkError;
    }

    throw error;
  } finally {
    if (timeoutId != null) {
      window.clearTimeout(timeoutId);
    }
  }
}

export function subscribeToNetworkIssues(listener) {
  window.addEventListener(NETWORK_ISSUE_EVENT, listener);
  return () => window.removeEventListener(NETWORK_ISSUE_EVENT, listener);
}

export const authApi = {
  googleLogin: async (credential) => {
    return request("/auth/google", { method: "POST", body: { credential } });
  },
  register: async (payload) => {
    return request("/auth/register", { method: "POST", body: payload });
  },
  login: async (payload) => {
    return request("/auth/login", { method: "POST", body: payload });
  },
  getMe: async () => request("/auth/me"),
};

export const meApi = {
  getUsage: async () => request("/me/usage"),
  getSubscription: async () => request("/me/subscription"),
};

export const chatApi = {
  newChat: async () => request("/chat/new", { method: "POST", body: {} }),
  getPromptSuggestions: async () => request("/chat/prompt-suggestions"),
  getHistory: async () => request("/chat/history"),
  getChat: async (chatId) => request(`/chat/${chatId}`),
  sendMessage: async (chatId, payload) => request(`/chat/${chatId}/message`, { method: "POST", body: payload }),
  regenerateMessage: async (chatId, messageId) =>
    request(`/chat/${chatId}/messages/${messageId}/regenerate`, { method: "POST" }),
  deleteChat: async (chatId) => request(`/chat/${chatId}`, { method: "DELETE" }),
};

export const translateApi = {
  translate: async (payload) => request("/translate", { method: "POST", body: payload }),
};

export const billingApi = {
  createOrder: async (payload) => request("/create-order", { method: "POST", body: payload }),
  verifyPayment: async (payload) => request("/verify-payment", { method: "POST", body: payload }),
  createSubscription: async (plan) => request("/billing/create-subscription", { method: "POST", body: { plan } }),
  verifySubscription: async (payload) => request("/billing/verify-subscription", { method: "POST", body: payload }),
};

export const plansApi = {
  getPublicPlans: async () => request("/plans"),
};

export const accountDeletionApi = {
  createRequest: async (payload) => request("/account-deletion-request", { method: "POST", body: payload }),
};

export const feedbackApi = {
  createRequest: async (payload) => request("/feedback", { method: "POST", body: payload }),
};

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  const isNetworkIssue =
    error?.code === "ECONNABORTED" ||
    error?.message === "Network Error" ||
    (!error?.response && typeof error?.message === "string");
  if (isNetworkIssue) {
    return "Please check your network connection and try again.";
  }
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
export default request;
