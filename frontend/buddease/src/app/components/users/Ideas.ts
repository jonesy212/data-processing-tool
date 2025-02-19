// Ideas.ts

import { AllStatus } from "../state/stores/DetailsListStore";

// Define the shape of UserIdea data
interface UserIdea {
    id: number;
    title: string;
    description: string;
    // Add more properties as needed
  }



export type Idea = {
  id: string; // Unique identifier for the idea
  title: string; // Title or headline of the idea
  description: string; // Detailed description or content of the idea
  author: string; // Author or creator of the idea
  createdAt: Date; // Date and time when the idea was created
  tags: string[]; // Tags or categories associated with the idea
  status?: AllStatus
  collaborators?: string[];
  // Add more properties as needed to represent an idea
};


interface IdeationSession {
  id: string;
  name: string;
  facilitator: string; // Assuming facilitator is the ID of the user
  participants: string[]; // Array of user IDs participating in the session
  startDate: Date;
  endDate?: Date; // Optional end date if the session has concluded
  ideas: string[]; // Array of ideas generated during the session
  notes?: string; // Optional notes or summary of the session
}




export type {  IdeationSession, UserIdea };

