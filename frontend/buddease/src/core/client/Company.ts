// Company.ts

import { Client } from "@/core/client/Client";
import { Project } from "@/core/models/projects/Project";
import MemberData from "@/core/models/teams/TeamMembers";

export interface Company extends MemberData {
  id: string;                       // Unique company ID
  name: string;                     // Company name
  address?: string;                 // Optional company address
  email?: string;                   // Contact email
  phone?: string;                   // Contact phone number
  website?: string;                 // Optional website
  clients?: Client[];               // List of clients associated with the company
  projects?: Project[];             // Projects associated with the company
  createdAt?: Date;                 // Creation timestamp
  updatedAt?: Date;                 // Last update timestamp
  industry?: string;                // Industry type
  notes?: string;                   // Optional notes or description
  // Add other company-specific properties here
}
