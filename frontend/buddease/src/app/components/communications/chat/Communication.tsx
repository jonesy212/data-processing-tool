// Communication.tsx
import { Message } from "@/app/generators/GenerateChatInterfaces";
import React from "react";
import { UserRoleEnum } from "../../users/UserRoles";
import { User } from "@/app/components/users/User";


// Fix the Sender type with the correct role type
interface Sender extends Partial<User> {
  id: string;
  tags: string[];
  isUserMessage: boolean;
  tier: string;
  createdAt: string;
  updatedAt: string;
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
      <div className="communication-sender">{sender.username}</div>
      <div className="communication-message">{message.content}</div>
      <div className="communication-timestamp">{timestamp.toLocaleString()}</div>
    </div>
  );
};

export default CommunicationPage;
export type { Communication, Sender };
