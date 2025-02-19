// GroupChatMessage.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import ChatCard from '../../cards/ChatCard';

interface GroupChatMessage {
  id: number;
  sender: string;
  message: string;
  timestamp: string;
}

interface GroupChatMessageProps {
  groupId: string; // Unique identifier for the group
}

const GROUP_CHAT_API_ENDPOINT = 'https://example.com/api/group-chat/messages';

const GroupChatMessage: React.FC<GroupChatMessageProps> = ({ groupId }) => {
  const [groupChatMessages, setGroupChatMessages] = useState<GroupChatMessage[]>([]);

  useEffect(() => {
    const fetchGroupChatMessages = async () => {
      try {
        const response: AxiosResponse<GroupChatMessage[]> = await axios.get(GROUP_CHAT_API_ENDPOINT, {
          params: { groupId, limit: 10 }, // Adjust limit as needed
        });

        setGroupChatMessages(response.data);
      } catch (error) {
        console.error('Error fetching group chat messages:', error);
        // Handle error appropriately
      }
    };

    // Fetch group chat messages when the component mounts
    fetchGroupChatMessages();

    // Cleanup logic if needed
    return () => {
      // Any cleanup logic can go here
    };
  }, [groupId]); // Re-fetch messages when groupId changes

  return (
    <div>
      <h2>Group Chat Dashboard</h2>
      <div className="group-chat-messages">
        {groupChatMessages.map((message) => (
          <ChatCard
            key={message.id}
            sender={message.sender}
            message={message.message}
            timestamp={message.timestamp}
          />
        ))}
      </div>
    </div>
  );
};

export default GroupChatMessage;
