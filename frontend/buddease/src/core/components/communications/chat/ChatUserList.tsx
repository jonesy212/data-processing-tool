// ChatUserList.tsx
import React from 'react';

interface ChatUserListProps {
  users: string[];
}

const ChatUserList: React.FC<ChatUserListProps> = ({ users }) => {
  return (
    <div className="chat-user-list">
      <h3>Users in the Chat</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default ChatUserList;
