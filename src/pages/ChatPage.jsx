import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Menu, Plus } from "lucide-react";
import { chatApi, getApiErrorMessage, translateApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import LoadingSpinner from "../components/LoadingSpinner";
import PlanBadge from "../components/PlanBadge";
import UpgradePrompt from "../components/UpgradePrompt";

const GARO_CHAT_UPGRADE_MESSAGE = "Garo chat is available on paid plans. Upgrade your plan to continue.";
const CHAT_INPUT_LANGUAGE = "auto";
const FALLBACK_PROMPT_SUGGESTIONS = [
  "Tell me 10 interesting facts about Meghalaya's history, culture, festivals, tribes, and famous places in simple student-friendly language.",
  "Quiz me with 20 general knowledge questions about Meghalaya, including answers and short explanations.",
  "Explain Meghalaya district-wise with important facts about geography, people, culture, tourism, and current development for students.",
];

function visibleChats(history) {
  return history.filter((chat) => chat.title !== "New Chat");
}

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("garo2_theme") || "dark");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [promptSuggestions, setPromptSuggestions] = useState(FALLBACK_PROMPT_SUGGESTIONS);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const bottomRef = useRef(null);
  const copyTimerRef = useRef(null);
  const currentPlan = String(user?.plan || "free").toLowerCase();
  const isFreePlan = currentPlan === "free";
  const showUpgradePopup = error.includes("Upgrade your plan to continue.");
  const upgradePromptMessage = error.includes("Upgrade your plan to continue.")
    ? error
    : "You have reached your limit for this plan. Upgrade your plan to continue.";

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      await Promise.all([
        loadHistory(),
        loadPromptSuggestions(),
      ]);
      setInitialLoading(false);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("garo2_theme", theme);
  }, [theme]);

  useEffect(() => {
    const syncAppHeight = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${Math.round(viewportHeight)}px`);
    };

    const syncOnNextFrame = () => {
      window.requestAnimationFrame(() => {
        syncAppHeight();
      });
    };

    document.body.classList.add("app-page");
    syncAppHeight();
    syncOnNextFrame();

    window.addEventListener("resize", syncOnNextFrame);
    window.addEventListener("orientationchange", syncOnNextFrame);
    window.addEventListener("pageshow", syncOnNextFrame);
    window.visualViewport?.addEventListener("resize", syncOnNextFrame);

    return () => {
      document.body.classList.remove("app-page");
      window.removeEventListener("resize", syncOnNextFrame);
      window.removeEventListener("orientationchange", syncOnNextFrame);
      window.removeEventListener("pageshow", syncOnNextFrame);
      window.visualViewport?.removeEventListener("resize", syncOnNextFrame);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const loadHistory = async () => {
    try {
      const history = await chatApi.getHistory();
      setChats(visibleChats(history));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load chat history."));
    }
  };

  const loadPromptSuggestions = async () => {
    try {
      const response = await chatApi.getPromptSuggestions();
      const prompts = Array.isArray(response?.prompts) ? response.prompts.filter(Boolean) : [];
      if (prompts.length) {
        setPromptSuggestions(prompts);
      }
    } catch (_err) {
      setPromptSuggestions(FALLBACK_PROMPT_SUGGESTIONS);
    }
  };

  const openChat = async (chatId) => {
    try {
      const chat = await chatApi.getChat(chatId);
      setActiveChatId(chatId);
      setMessages(chat.messages || []);
      setMobileSidebarOpen(false);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not open this chat."));
    }
  };

  const createChat = async () => {
    setActiveChatId(null);
    setMessages([]);
    setMobileSidebarOpen(false);
    setError("");
  };

  const deleteChat = async (chatId) => {
    try {
      await chatApi.deleteChat(chatId);
      const nextChats = chats.filter((chat) => chat.id !== chatId);
      setChats(nextChats);
      if (activeChatId === chatId) {
        setActiveChatId(nextChats[0]?.id ?? null);
        if (nextChats[0]) {
          await openChat(nextChats[0].id);
        } else {
          setMessages([]);
        }
      }
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete this chat."));
    }
  };

  const refreshHistory = async (preferredChatId) => {
    const history = await chatApi.getHistory();
    setChats(visibleChats(history));
    if (preferredChatId) {
      setActiveChatId(preferredChatId);
    }
  };

  const handleLanguageChange = (nextLanguage) => {
    if (nextLanguage === "garo" && isFreePlan) {
      setSelectedLanguage("english");
      setError(GARO_CHAT_UPGRADE_MESSAGE);
      setMobileSidebarOpen(false);
      return;
    }

    setSelectedLanguage(nextLanguage);
    setError("");
  };

  const submitMessage = async ({ text }) => {
    if (selectedLanguage === "garo" && isFreePlan) {
      setError(GARO_CHAT_UPGRADE_MESSAGE);
      return;
    }

    setPending(true);
    setError("");
    try {
      let chatId = activeChatId;
      if (!chatId) {
        const chat = await chatApi.newChat();
        chatId = chat.id;
        setActiveChatId(chat.id);
      }

      const optimisticUserMessage = {
        id: Date.now(),
        role: "user",
        content: text,
        input_language: CHAT_INPUT_LANGUAGE,
        output_language: selectedLanguage,
      };
      setMessages((prev) => [...prev, optimisticUserMessage]);

      const response = await chatApi.sendMessage(chatId, {
        content: text,
        input_language: CHAT_INPUT_LANGUAGE,
        output_language: selectedLanguage,
      });
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== optimisticUserMessage.id),
        response.user_message,
        response.assistant_message,
      ]);
      await refreshHistory(chatId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send the message."));
    } finally {
      setPending(false);
    }
  };

  const sendMessage = async ({ text }) => {
    await submitMessage({ text });
  };

  const handleTranslate = async ({ text, translationMode }) => {
    setPending(true);
    setError("");
    try {
      const sourceLanguage = translationMode === "garo_to_english" ? "garo" : "english";
      const targetLanguage = translationMode === "garo_to_english" ? "english" : "garo";
      const sourceLabel = translationMode === "garo_to_english" ? "Garo" : "English";
      const targetLabel = translationMode === "garo_to_english" ? "English" : "Garo";

      const optimisticUserMessage = {
        id: Date.now(),
        role: "user",
        content: text,
        input_language: sourceLanguage,
        output_language: targetLanguage,
        message_kind: "translate",
        translation_mode: translationMode,
      };
      setMessages((prev) => [...prev, optimisticUserMessage]);

      const response = await translateApi.translate({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      });

      const assistantMessage = {
        id: optimisticUserMessage.id + 1,
        role: "assistant",
        content: `${sourceLabel} - ${text}\n\n${targetLabel} - ${response.translated_text}`,
        input_language: sourceLanguage,
        output_language: targetLanguage,
        message_kind: "translate",
        translation_mode: translationMode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not translate the text."));
    } finally {
      setPending(false);
    }
  };

  const handleCopyMessage = useCallback(async (message) => {
    try {
      await navigator.clipboard.writeText(message.content || "");
      const messageId = String(message.id);
      setCopiedMessageId(messageId);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => setCopiedMessageId(null), 1800);
    } catch (err) {
      setError("Could not copy the response.");
    }
  }, []);

  const handleRegenerateMessage = useCallback(async (assistantMessage) => {
    if (pending) {
      return;
    }

    if (assistantMessage.message_kind === "translate") {
      setError("Regenerate is only available for saved chat responses.");
      return;
    }

    if (!activeChatId) {
      setError("Could not find this chat.");
      return;
    }

    const assistantIndex = messages.findIndex((message) => message.id === assistantMessage.id);
    if (assistantIndex <= 0) {
      setError("Could not find the prompt for this response.");
      return;
    }

    const promptMessage = [...messages]
      .slice(0, assistantIndex)
      .reverse()
      .find((message) => message.role === "user");

    if (!promptMessage) {
      setError("Could not find the prompt for this response.");
      return;
    }

    if (promptMessage.message_kind === "translate") {
      setError("Regenerate is only available for saved chat responses.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const response = await chatApi.regenerateMessage(activeChatId, assistantMessage.id);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, ...response.assistant_message }
            : message,
        ),
      );
      await refreshHistory(response.chat?.id || activeChatId);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not regenerate the response."));
    } finally {
      setPending(false);
    }
  }, [activeChatId, messages, pending]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileSidebarOpen ? "open" : ""}`}>
        <Sidebar
          user={user}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={openChat}
          onDeleteChat={deleteChat}
          onNewChat={createChat}
          onLogout={logout}
        />
      </aside>

      <main className={`chat-layout ${initialLoading ? "is-loading" : ""}`}>
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="topbar-title">Garo2</div>
          <div className="topbar-plan desktop-only-flex">
            <PlanBadge plan={currentPlan} />
            <Link to="/usage" className="topbar-link-button">
              Usage
            </Link>
          </div>
          <label className="language-selector desktop-only-flex">
            <span>Language</span>
            <select value={selectedLanguage} onChange={(event) => handleLanguageChange(event.target.value)}>
              <option value="english">English</option>
              <option value="garo">{isFreePlan ? "Garo (upgrade)" : "Garo"}</option>
            </select>
            <Bot size={16} className="language-selector-icon" aria-hidden="true" />
          </label>
          <label className="language-selector mobile-only-flex mobile-header-language">
            <select
              aria-label="Select language"
              value={selectedLanguage}
              onChange={(event) => handleLanguageChange(event.target.value)}
            >
              <option value="english">English</option>
              <option value="garo">{isFreePlan ? "Garo (upgrade)" : "Garo"}</option>
            </select>
            <Bot size={14} className="language-selector-icon" aria-hidden="true" />
          </label>
          <button className="icon-button header-new-chat" onClick={createChat} aria-label="New chat" title="New chat">
            <Plus size={18} />
          </button>
        </header>

        {error && !showUpgradePopup ? (
          <div className="error-banner">
            {error}
          </div>
        ) : null}
        {showUpgradePopup ? (
          <div className="upgrade-prompt-overlay">
            <UpgradePrompt message={upgradePromptMessage} onClose={() => setError("")} />
          </div>
        ) : null}
        {initialLoading ? (
          <div className="chat-page-loader">
            <LoadingSpinner label="Loading chats" />
          </div>
        ) : null}
        {!initialLoading ? (
          <ChatWindow
            messages={messages}
            pending={pending}
            bottomRef={bottomRef}
            onCopyMessage={handleCopyMessage}
            onRegenerateMessage={handleRegenerateMessage}
            copiedMessageId={copiedMessageId}
            userName={user?.name || "there"}
          />
        ) : null}
        <ChatInput
          onSend={sendMessage}
          onTranslate={handleTranslate}
          disabled={pending || initialLoading}
          showMobilePrompts={!initialLoading && !messages.length}
          promptSuggestions={promptSuggestions}
        />
      </main>

      {mobileSidebarOpen ? <div className="backdrop" onClick={() => setMobileSidebarOpen(false)} /> : null}
    </div>
  );
}
