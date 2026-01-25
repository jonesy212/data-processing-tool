// CommunicationComponent.tsx
import { CommunicationActions } from '@/core/actions/CommunicationActions';
import { ChatRoom } from '@/core/communications/ChatRoom';
import Communication from '@/core/components/community/CommunicationComponent';
import { Message } from '@/core/generators/GenerateChatInterfaces';
import React from 'react';
import { useDispatch } from 'react-redux';

const CommunicationComponent: React.FC = () => {
  const dispatch = useDispatch();

  const handleStartCommunication = (id: string) => {
    dispatch(CommunicationActions.startCommunicationRequest(id));
  };

  const handleBatchCommunication = (ids: string[]) => {
    dispatch(CommunicationActions.batchStartCommunication(ids));
  };

  // Create an instance of ChatRoom
const chatRoom:  ChatRoom = {
  id: "roomId",
  creatorId: "creatorId",
  users: [],

  topics: [],
  messages: [],
  // Add other required properties
};


  const message: Message = {
    id: "1",
    channelId: chatRoom,
    content: "Sample content",
    timestamp: new Date(),
    text: "Sample text",
    username: "JohnDoe",
  };

  return (
    <div>
      <Communication
        message={message}
        sender={message.username}
        timestamp={new Date()}
      />
      <button onClick={() => handleStartCommunication("1")}>
        Start Communication
      </button>
      <button onClick={() => handleBatchCommunication(["2", "3"])}>
        Batch Start Communication
      </button>
    </div>
  );
};

export default CommunicationComponent;
