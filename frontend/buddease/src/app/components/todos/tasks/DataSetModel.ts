// Assuming you have an interface for the User and Team models as well

import { Team } from "../../models/teams/Team";

interface DatasetModel {
    id: number;
    name: string;
    description: string | null;
    file_path_or_url: string;
    uploaded_by: number; // Assuming this is the user ID
    uploaded_at: string; // Assuming the date is sent as a string
    tags_or_categories: string; // Comma-separated list or JSON array
    format: string;
    visibility: 'public' | 'private' | 'shared'; // Assuming visibility can only be one of these values
    // Add other fields as needed
  
    // Relationships
    uploaded_by_team_id: number | null; // Assuming this is the team ID
    uploaded_by_team: Team | null; // Assuming you have a Team interface
  
    // Optional: Add other relationships as needed
  }
  
  
  // Example usage:
  const dataset: DatasetModel = {
    id: 1,
    name: 'Example Dataset',
    description: 'An example dataset',
    file_path_or_url: '/datasets/example.csv',
    uploaded_by: 1, // Assuming user ID 1
    uploaded_at: '2023-01-01T12:00:00Z', // Example date string
    tags_or_categories: 'tag1, tag2',
    format: 'csv',
    visibility: 'private',
    uploaded_by_team_id: 1, // Assuming team ID 1
    uploaded_by_team: {
      id: 1,
      name: 'Development Team',
      description: 'A team focused on software development',
      members: [],
      projects: [],
      creationDate: new Date(),
      isActive: false,
      leader: null
      
      // Other team fields
    },
    // Other fields
  };
  export type { DatasetModel };
