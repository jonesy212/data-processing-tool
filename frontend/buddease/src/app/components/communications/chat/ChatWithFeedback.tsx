// ChatWithFeedback.tsx
import React, { useEffect, useState } from 'react';
import FeedbackLoop from '../../FeedbackLoop';
import { Feedback } from '../../support/Feedback';
import FeedbackService from '../../support/FeedbackService';
import ChatRoom from './ChatRoom'; // Import the ChatRoom component

interface ChatWithFeedbackProps {
  roomId: string;
}

const ChatWithFeedback: React.FC<ChatWithFeedbackProps> = ({ roomId }) => {
  const [chatMessages, setChatMessages] = useState<string[]>([]); // Update the type if needed
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    // Initialize the FeedbackService
    const feedbackService = FeedbackService.getInstance();

    // Simulate gathering feedback from chat messages
    const feedbackData: Feedback[] = chatMessages.map((message, index) => ({
      userId: `user${index + 1}`,
      comment: message,
      rating: 5, // You can adjust the rating as needed
      timestamp: new Date(),
    }));

    // Gather and process feedback
    feedbackService.gatherFeedback(feedbackData);
  }, [chatMessages]);

  // Function to handle sending messages in the chat
  const sendMessage = (message: string) => {
    setChatMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <div>
      {/* ChatRoom component */}
      <ChatRoom roomId={roomId} onSendMessage={sendMessage} />

      {/* FeedbackLoop component */}
      <FeedbackLoop feedback={feedback} />
    </div>
  );
};

export default ChatWithFeedback;
