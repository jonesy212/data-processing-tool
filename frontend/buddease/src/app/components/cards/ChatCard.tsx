// components/ChatCard.tsx
import React from 'react';

export interface ChatCardProps {
  sender: string;
  message: string;
  timestamp: string;
  isSentByUser?: boolean;
  chatType?: 'public' | 'private' | 'group';
  isAdmin?: boolean;
  isModerator?: boolean;
}

const ChatCard: React.FC<ChatCardProps> = ({
  sender,
  message,
  timestamp,
  isSentByUser = false,
  chatType = 'public',
  isAdmin = false,
  isModerator = false,
}) => {
  const messageDate = new Date(timestamp);
  const formattedTimestamp = messageDate.toLocaleString();

  return (
    <div className={`message ${isSentByUser ? 'sent-message' : 'received-message'}`}>
      <h3>{sender}</h3>
      <p>{message}</p>
      <span className="timestamp">{formattedTimestamp}</span>
      {isAdmin && <span className="admin-badge">Admin</span>}
      {isModerator && <span className="moderator-badge">Moderator</span>}
      <span className={`chat-type-badge ${chatType}`}>{chatType}</span>
    </div>
  );
};

export default ChatCard;
