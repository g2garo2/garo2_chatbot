import { useEffect, useRef, useState } from "react";
import { Menu, Plus } from "lucide-react";
import { chatApi, uploadApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";

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
      setError(err?.response?.data?.detail || "Could not load chat history.");
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
      setError(err?.response?.data?.detail || "Could not open this chat.");
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
      setError(err?.response?.data?.detail || "Could not delete this chat.");
    }
  };

  const refreshHistory = async (preferredChatId) => {
    const history = await chatApi.getHistory();
    setChats(visibleChats(history));
    if (preferredChatId) {
      setActiveChatId(preferredChatId);
    }
  };

  const submitMessage = async ({ text, imageFile = null, imageUrl = null }) => {
    setPending(true);
    setError("");
    try {
      let chatId = activeChatId;
      if (!chatId) {
        const chat = await chatApi.newChat();
        chatId = chat.id;
        setActiveChatId(chat.id);
      }

      let resolvedImageUrl = imageUrl;
      if (imageFile) {
        const upload = await uploadApi.uploadImage(imageFile);
        resolvedImageUrl = upload.image_url;
      }

      const optimisticUserMessage = {
        id: Date.now(),
        role: "user",
        content: text,
        image_url: resolvedImageUrl,
        input_language: "english",
        output_language: selectedLanguage,
      };
      setMessages((prev) => [...prev, optimisticUserMessage]);

      const response = await chatApi.sendMessage(chatId, {
        content: text,
        image_url: resolvedImageUrl,
        input_language: "english",
        output_language: selectedLanguage,
      });
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== optimisticUserMessage.id),
        response.user_message,
        response.assistant_message,
      ]);
      await refreshHistory(chatId);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not send the message.");
    } finally {
      setPending(false);
    }
  };

  const sendMessage = async ({ text, imageFile }) => {
    await submitMessage({ text, imageFile });
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

    await submitMessage({
      text: promptMessage.content,
      imageUrl: promptMessage.image_url || null,
    });
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
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </aside>

      <main className="chat-layout">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="topbar-title">Garo2</div>
          <label className="language-selector desktop-only-flex">
            <span>Language</span>
            <select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)}>
              <option value="english">English</option>
              <option value="garo">Garo</option>
            </select>
          </label>
          <button className="icon-button header-new-chat" onClick={createChat} aria-label="New chat" title="New chat">
            <Plus size={18} />
          </button>
        </header>

        {error ? <div className="error-banner">{error}</div> : null}
        <ChatWindow
          messages={messages}
          pending={pending}
          bottomRef={bottomRef}
          onCopyMessage={handleCopyMessage}
          onRegenerateMessage={handleRegenerateMessage}
          copiedMessageId={copiedMessageId}
        />
        <ChatInput
          onSend={sendMessage}
          disabled={pending}
          showMobilePrompts={!messages.length}
        />
      </main>

      {mobileSidebarOpen ? <div className="backdrop" onClick={() => setMobileSidebarOpen(false)} /> : null}
    </div>
  );
}
