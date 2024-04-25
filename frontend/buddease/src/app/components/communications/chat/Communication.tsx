// Communication.tsx
// Communication.tsx
import { Message } from "@/app/generators/GenerateChatInterfaces";
import React from "react";




interface Sender {
  id: string;
  name: string;
  // Add any other properties specific to the sender
}

interface Communication {
    id: string;
  messages: Message[];
  participants: Sender[];
}
interface CommunicationProps {
  message: Message;
  sender: Sender;
  timestamp: Date;
}


const CommunicationPage: React.FC<CommunicationProps> = ({ message, sender, timestamp }) => {
  return (
    <div className="communication">
      <div className="communication-sender">{sender}</div>
      <div className="communication-message">{message}</div>
      <div className="communication-timestamp">{timestamp.toLocaleString()}</div>
    </div>
  );
};

export default CommunicationPage;
export type { Communication };
