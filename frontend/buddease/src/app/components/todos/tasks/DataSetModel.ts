// Assuming you have an interface for the User and Team models as well

import { Team } from "../../models/teams/Team";

interface DatasetModel {
    id: number;
    name: string;
    description: string | null;
    filePathOrUrl: string;
    uploadedBy: number; // Assuming this is the user ID
    uploadedAt: string; // Assuming the date is sent as a string
    tagsOrCategories: string; // Comma-separated list or JSON array
    format: string;
    visibility: 'public' | 'private' | 'shared'; // Assuming visibility can only be one of these values
    // Add other fields as needed
  
    // Relationships
    uploadedByTeamId: number | null; // Assuming this is the team ID
    uploadedByTeam: Team | null; // Assuming you have a Team interface
  
    // Optional: Add other relationships as needed
  }
  
// Example usage:
const dataset: DatasetModel = {
  id: 1,
  name: 'Example Dataset', 
  description: 'An example dataset',
  filePathOrUrl: '/datasets/example.csv',
  uploadedBy: 1, // Assuming user ID 1
  uploadedAt: '2023-01-01T12:00:00Z', // Example date string
  tagsOrCategories: 'tag1, tag2',
  format: 'csv',
  visibility: 'private',
  uploadedByTeamId: 1, // Assuming team ID 1
  uploadedByTeam: {
    id: 1,
    teamName: 'Development Team',
    description: 'A team focused on software development', 
    members: [],
    projects: [],
    creationDate: new Date(),
    isActive: false,
    leader: null,
    progress: null,// Added missing 'progress' property
    then(callback) {
        callback(dataset as DatasetModel & Team);
    }, 
    // Other team fields
  },
  // Other fields
};

  export type { DatasetModel };
