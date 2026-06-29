import { useMemo, useState } from "react";
import { CreditCard, Gauge, LogOut, MessageSquare, Search, Settings, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import PlanBadge from "./PlanBadge";

export default function Sidebar({
  user,
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  onLogout,
}) {
  const [query, setQuery] = useState("");

  const filteredChats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return chats;
    }

    return chats.filter((chat) => chat.title.toLowerCase().includes(normalizedQuery));
  }, [chats, query]);

  return (
    <div className="sidebar-inner">
      <div className="sidebar-brand desktop-only">
        <img src="/g2-logo.jpeg" alt="Garo2 logo" className="brand-logo" />
        <div>
          <div className="sidebar-brand-title">Garo2</div>
        </div>
      </div>

      <div className="sidebar-header">
        <label className="sidebar-search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats"
          />
        </label>
      </div>

      <div className="sidebar-nav-links">
        <NavLink to="/usage" className="secondary-button sidebar-link-button">
          <Gauge size={16} />
          Usage
        </NavLink>
        <NavLink to="/pricing" className="secondary-button sidebar-link-button">
          <CreditCard size={16} />
          Pricing
        </NavLink>
        <NavLink to="/settings" className="secondary-button sidebar-link-button">
          <Settings size={16} />
          Settings
        </NavLink>
      </div>

      <div className="chat-list">
        {filteredChats.map((chat) => (
          <button
            key={chat.id}
            className={`chat-row ${chat.id === activeChatId ? "active" : ""}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="chat-row-main">
              <MessageSquare size={16} />
              <span>{chat.title}</span>
            </div>
            <span
              className="delete-chat"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              <Trash2 size={14} />
            </span>
          </button>
        ))}
        {!filteredChats.length ? <div className="sidebar-empty">No chats found.</div> : null}
      </div>

      <div className="sidebar-footer">
        <button className="secondary-button" onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </button>

        <div className="user-chip sidebar-user">
          {user?.avatar ? <img src={user.avatar} alt={user.name} /> : null}
          <div className="user-chip-copy">
            <strong>{user?.name}</strong>
            <PlanBadge plan={user?.plan || "free"} />
          </div>
        </div>
      </div>
    </div>
  );
}
