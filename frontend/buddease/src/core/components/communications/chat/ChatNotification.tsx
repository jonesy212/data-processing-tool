// ChatNotification.tsx
import React from 'react';

interface ChatNotificationProps {
  content: string;
}

const ChatNotification: React.FC<ChatNotificationProps> = ({ content }) => {
  return (
    <div className="chat-notification">
      <p>{content}</p>
    </div>
  );
};

export default ChatNotification;
