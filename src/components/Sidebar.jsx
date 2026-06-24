import { MessageSquare, Plus, Trash2, LogOut } from "lucide-react";

export default function Sidebar({ user, chats, activeChatId, onSelectChat, onDeleteChat, onNewChat, onLogout }) {
  return (
    <div className="sidebar-inner">
      <div className="sidebar-brand desktop-only">
        <img src="/g2-logo.jpeg" alt="Garo2 logo" className="brand-logo" />
        <div className="sidebar-brand-title">Garo2</div>
      </div>

      <div className="sidebar-header">
        <button className="primary-button icon-only-button" onClick={onNewChat} aria-label="New chat" title="New chat">
          <Plus size={16} />
        </button>
      </div>

      <div className="chat-list">
        {chats.map((chat) => (
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
      </div>

      <button className="secondary-button" onClick={onLogout}>
        <LogOut size={16} />
        Logout
      </button>

      <div className="user-chip sidebar-user">
        {user?.avatar ? <img src={user.avatar} alt={user.name} /> : null}
        <strong>{user?.name}</strong>
      </div>
    </div>
  );
}
