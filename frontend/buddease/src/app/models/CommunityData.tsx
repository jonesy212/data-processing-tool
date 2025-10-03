// CommunityData.tsx
import { Project } from "@/app/models/projects/Project";
import { Data } from "./data/Data";
import { Team } from "./teams/Team";
import { TeamMember } from "./teams/TeamMembers";


export interface CommunityData extends Data {
    id: string | number;
    name: string;
    description: string;
    projects: Project[];
    teams: Team[];
  teamMembers: TeamMember[];
  type?: 
    // Add other properties as needed
  }
  

  