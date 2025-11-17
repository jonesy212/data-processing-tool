// Collaborator.ts
import { Member } from "@/app/members/Member";


export interface Collaborator extends Member {
  collaborations: number; // Number of collaborations
  // Add any other properties specific to Collaborator
}


export interface Contribution {
  projectId: string;       // or number if projects have IDs
  projectName: string;
  role?: string;           // e.g., "developer", "designer"
  commits?: number;        // optional number of commits/contributions
  details: { note: string; date?: string }[]
  date?: string;
}

interface Contributor extends Member {
  contributions: Contribution[]; // detailed breakdown per project
  joinedAt?: Date;
  active?: boolean;
  
}

export type { Contributor }