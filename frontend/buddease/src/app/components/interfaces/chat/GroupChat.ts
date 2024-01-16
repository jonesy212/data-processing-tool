import { ChatMessage } from "../../communications";
import { TeamMember } from "../../models/teams/TeamMembers";

interface GroupChat {
    id: number;
    name: string;
    members: TeamMember[];
    messages: ChatMessage[];
    // Add more GroupChat-specific fields as needed
  }