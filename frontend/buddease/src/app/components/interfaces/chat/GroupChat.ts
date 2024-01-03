import { ChatMessage } from "../../communications";

interface GroupChat {
    id: number;
    name: string;
    members: TeamMember[];
    messages: ChatMessage[];
    // Add more GroupChat-specific fields as needed
  }