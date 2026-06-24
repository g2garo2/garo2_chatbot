import { useEffect, useRef, useState } from "react";
import { Menu, Plus } from "lucide-react";
import { chatApi, uploadApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";

const defaultLanguageState = {
  inputLanguage: "english",
  outputLanguage: "english",
};

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [languageState, setLanguageState] = useState(defaultLanguageState);
  const [theme, setTheme] = useState(() => localStorage.getItem("garo2_theme") || "dark");
  const bottomRef = useRef(null);

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

  const loadHistory = async () => {
    try {
      const history = await chatApi.getHistory();
      setChats(history);
      if (history.length > 0) {
        await openChat(history[0].id);
      }
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
    setChats(history);
    if (preferredChatId) {
      setActiveChatId(preferredChatId);
    }
  };

  const sendMessage = async ({ text, imageFile }) => {
    setPending(true);
    setError("");
    try {
      let chatId = activeChatId;
      if (!chatId) {
        const chat = await chatApi.newChat();
        chatId = chat.id;
        setActiveChatId(chat.id);
      }

      let imageUrl = null;
      if (imageFile) {
        const upload = await uploadApi.uploadImage(imageFile);
        imageUrl = upload.image_url;
      }

      const optimisticUserMessage = {
        id: Date.now(),
        role: "user",
        content: text,
        image_url: imageUrl,
        input_language: languageState.inputLanguage,
        output_language: languageState.outputLanguage,
      };
      setMessages((prev) => [...prev, optimisticUserMessage]);

      const response = await chatApi.sendMessage(chatId, {
        content: text,
        image_url: imageUrl,
        input_language: languageState.inputLanguage,
        output_language: languageState.outputLanguage,
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

  const activeChat = chats.find((chat) => chat.id === activeChatId);

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
          theme={theme}
          onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
        />
      </aside>

      <main className="chat-layout">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMobileSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="header-copy">
            <div className="brand-mark header-brand">
              <img src="/g2-logo.jpeg" alt="Garo2 logo" className="brand-logo" />
              <div className="topbar-title">{activeChat?.title || "Garo2"}</div>
            </div>
            <div className="topbar-subtitle">
              {activeChatId ? "Continue your conversation" : "Fast, bilingual AI help for chat, images, and translation"}
            </div>
          </div>
          <button className="icon-button" onClick={createChat} aria-label="New chat" title="New chat">
            <Plus size={18} />
          </button>
        </header>

        {error ? <div className="error-banner">{error}</div> : null}
        <ChatWindow
          messages={messages}
          pending={pending}
          bottomRef={bottomRef}
          onPromptSelect={(prompt) => sendMessage({ text: prompt, imageFile: null })}
        />
        <ChatInput
          languageState={languageState}
          setLanguageState={setLanguageState}
          onSend={sendMessage}
          disabled={pending}
          theme={theme}
        />
      </main>

      {mobileSidebarOpen ? <div className="backdrop" onClick={() => setMobileSidebarOpen(false)} /> : null}
    </div>
  );
}
