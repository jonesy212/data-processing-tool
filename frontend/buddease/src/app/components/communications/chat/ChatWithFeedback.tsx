// ChatWithFeedback.tsx
import React, { useEffect, useState } from 'react';
import FeedbackLoop from '../../FeedbackLoop';
import { Feedback } from '../../support/Feedback';
import FeedbackService from '../../support/FeedbackService';
import ChatRoom from './ChatRoom'; // Import the ChatRoom component
import { Channel, ChannelRole, ChannelType } from '../../interfaces/chat/Channel';
import ChatMessageData from './ChatRoomDashboard';
import ChatEventService from '@/app/services/ChatEventService';
import ChatMessage from './ChatMessage';

interface ChatWithFeedbackProps {
  roomId: string;
}


const ChatWithFeedback: React.FC<ChatWithFeedbackProps> = ({ roomId }) => {
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackType, setFeedbackType] = useState<string>("defaultType");
  const [topics, setTopics] = useState<string[]>([]);
  const [chatEvent, setChatEvent] = useState<ChatMessage| null>(null); // Update state type

  useEffect(() => {
    const fetchChatEvent = async () => {
      try {
        const event = await ChatEventService.fetchChatEvent(roomId);
        setChatEvent(event); // Set the ChatMessage object
      } catch (error) {
        console.error("Error fetching chat event:", error);
      }
    };

    const fetchTopics = async () => {
      try {
        const response = await ChatEventService.fetchEvents(roomId, 10);
        const topics = response.map(event => event.eventName);
        setTopics(topics);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchChatEvent();
    fetchTopics();
  }, [roomId]);

  useEffect(() => {
    const feedbackService = FeedbackService.getInstance();

    const feedbackData: Feedback[] = chatMessages.map((message, index) => ({
      id: index.toString(),
      userId: `user${index + 1}`,
      comment: message,
      rating: 5,
      timestamp: new Date(),
      audioUrl: "https://audioExamp.com",
      videoUrl: "https://videoExamp.com",
      resolved: false,
    }));

    const channel: Channel = {
      id: roomId,
      name: "Chat Room",
      description: "A room for chat discussions",
      type: ChannelType.Public,
      members: [
        {
          userId: "user1",
          username: "User One",
          role: ChannelRole.Member,
        },
        // Add more members as needed
      ],
      messages: feedbackData.map(fb => ({
        messageId: fb.id,
        userId: fb.userId,
        username: fb.userId, // Assuming the username is the same as userId for simplicity
        content: fb.comment,
        timestamp: fb.timestamp,
      })),
    };

    feedbackService.gatherFeedback(feedbackData, channel);
  }, [chatMessages]);

  const sendMessage = (message: ChatMessageData) => {
    setChatMessages((prevMessages) => [...prevMessages, message.content]);
  };

  return (
    <div>
      <ChatRoom
        roomId={roomId}
        onSendMessage={sendMessage}
        topics={topics}
        chatEvent={chatEvent} // Pass the ChatMessage object directly
      />
      <FeedbackLoop
        feedback={feedback}
        feedbackType={feedbackType}
      />
    </div>
  );
};

export default ChatWithFeedback;