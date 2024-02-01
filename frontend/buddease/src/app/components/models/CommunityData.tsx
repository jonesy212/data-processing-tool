// CommunityData.tsx
import Project from "../projects/Project";
import { Team } from "./teams/Team";
import { TeamMember } from "./teams/TeamMembers";


export interface CommunityData {
    id: string | number;
    name: string;
    description: string;
    projects: Project[];
    teams: Team[];
    teamMembers: TeamMember[];
    // Add other properties as needed
  }
  

  