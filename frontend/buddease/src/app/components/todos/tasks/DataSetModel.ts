// Assuming you have an interface for the User and Team models as well
import { Team } from "../../models/teams/Team";
import { DocumentPath } from "../../documents/DocumentGenerator";
import { AllTypes } from "../../typings/PropTypes";

interface DatasetModel {
  id: string | number;
  name: string;
  description: string | null;
  filePathOrUrl: string;
  uploadedBy: number; // Assuming this is the user ID
  uploadedAt: string; // Assuming the date is sent as a string
  tagsOrCategories: string; // Comma-separated list or JSON array
  format: string;
  visibility: AllTypes
  // Add other fields as needed
  type?: AllTypes;
  // Relationships
  uploadedByTeamId: number | null; // Assuming this is the team ID
  uploadedByTeam: Team | null; // Assuming you have a Team interface
  lastModifiedDate: Date;
  filePath?: DocumentPath;

  // Optional: Add other relationships as needed
}

// Example usage:
const dataset: DatasetModel = {
  id: 1,
  name: "Example Dataset",
  description: "An example dataset",
  filePathOrUrl: "/datasets/example.csv",
  uploadedBy: 1, // Assuming user ID 1
  uploadedAt: "2023-01-01T12:00:00Z", // Example date string
  tagsOrCategories: "tag1, tag2",
  format: "csv",
  visibility: "private",
  uploadedByTeamId: 1, // Assuming team ID 1
  uploadedByTeam: null,
  type: "url",
  lastModifiedDate: new Date()
  // Other fields
};

export { dataset };
export type { DatasetModel };

