// GroupChat.ts
 import ChatMessage from "@/app/components/communications/chat/ChatMessage";
import { TeamMember } from "@/app/models/teams/TeamMembers";

interface GroupChat {
    id: number;
    name: string;
    members: TeamMember[];
    messages: ChatMessage[];
    // Add more GroupChat-specific fields as needed
}
  
export type {GroupChat}