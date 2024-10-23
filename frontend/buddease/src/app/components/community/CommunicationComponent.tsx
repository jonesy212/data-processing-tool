// CommunicationComponent.tsx
import { Message } from '@/app/generators/GenerateChatInterfaces';
import React from 'react';
import { useDispatch } from 'react-redux';
import Communication from '../communications/chat/Communication';
import { CommunicationActions } from './CommunicationActions';
import { ChatRoom } from '../calendar/CalendarSlice';

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
