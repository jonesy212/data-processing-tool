 import ChatMessage from "../../communications/chat/ChatMessage";
import { TeamMember } from "../../models/teams/TeamMembers";

interface GroupChat {
    id: number;
    name: string;
    members: TeamMember[];
    messages: ChatMessage[];
    // Add more GroupChat-specific fields as needed
}
  
export type {GroupChat}