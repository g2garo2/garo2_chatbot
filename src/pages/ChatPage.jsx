import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import { chatApi, getApiErrorMessage, translateApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import PlanBadge from "../components/PlanBadge";
import UpgradePrompt from "../components/UpgradePrompt";

const GARO_CHAT_UPGRADE_MESSAGE = "Garo chat is available on paid plans. Upgrade your plan to continue.";
const CHAT_INPUT_LANGUAGE = "auto";

function visibleChats(history) {
  return history.filter((chat) => chat.title !== "New Chat");
}

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("garo2_theme") || "dark");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const bottomRef = useRef(null);
  const copyTimerRef = useRef(null);
  const currentPlan = String(user?.plan || "free").toLowerCase();
  const isFreePlan = currentPlan === "free";
  const upgradePromptMessage = error.includes("Upgrade your plan to continue.")
    ? error
    : "You have reached your limit for this plan. Upgrade your plan to continue.";

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("garo2_theme", theme);
  }, [theme]);

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
      const modeLabel =
        translationMode === "garo_to_english" ? "Translate Garo to English" : "Translate English to Garo";

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
        content: `${modeLabel}\n\n${response.translated_text}`,
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

  const handleCopyMessage = async (message) => {
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
  };

  const handleRegenerateMessage = async (assistantMessage) => {
    if (pending) {
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

    if (assistantMessage.message_kind === "translate" || promptMessage.message_kind === "translate") {
      await handleTranslate({
        text: promptMessage.content,
        translationMode: promptMessage.translation_mode || assistantMessage.translation_mode || "english_to_garo",
      });
      return;
    }

    await submitMessage({ text: promptMessage.content });
  };

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

      <main className="chat-layout">
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
          </label>
          <button className="icon-button header-new-chat" onClick={createChat} aria-label="New chat" title="New chat">
            <Plus size={18} />
          </button>
        </header>

        {error ? (
          <div className="error-banner">
            {error}
            {error.includes("Upgrade your plan to continue.") ? (
              <UpgradePrompt compact message={upgradePromptMessage} />
            ) : null}
          </div>
        ) : null}
        <ChatWindow
          messages={messages}
          pending={pending}
          bottomRef={bottomRef}
          onCopyMessage={handleCopyMessage}
          onRegenerateMessage={handleRegenerateMessage}
          copiedMessageId={copiedMessageId}
          userName={user?.name || "there"}
        />
        <ChatInput
          onSend={sendMessage}
          onTranslate={handleTranslate}
          disabled={pending}
          showMobilePrompts={!messages.length}
        />
      </main>

      {mobileSidebarOpen ? <div className="backdrop" onClick={() => setMobileSidebarOpen(false)} /> : null}
    </div>
  );
}
