// Communication.tsx
// Communication.tsx
import { Message } from "@/app/generators/GenerateChatInterfaces";
import React from "react";

interface CommunicationProps {
  message: Message;
  sender: Sender;
  timestamp: Date;
}

const Communication: React.FC<CommunicationProps> = ({ message, sender, timestamp }) => {
  return (
    <div className="communication">
      <div className="communication-sender">{sender}</div>
      <div className="communication-message">{message}</div>
      <div className="communication-timestamp">{timestamp.toLocaleString()}</div>
    </div>
  );
};

export default Communication;
