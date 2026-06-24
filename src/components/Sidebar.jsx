import { MessageSquare, Plus, Trash2, LogOut } from "lucide-react";

export default function Sidebar({ user, chats, activeChatId, onSelectChat, onDeleteChat, onNewChat, onLogout }) {
  return (
    <div className="sidebar-inner">
      <div className="sidebar-header">
        <button className="primary-button" onClick={onNewChat}>
          <Plus size={16} />
          New chat
        </button>
      </div>

      <div className="user-chip">
        {user?.avatar ? <img src={user.avatar} alt={user.name} /> : null}
        <div>
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>
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
    </div>
  );
}
