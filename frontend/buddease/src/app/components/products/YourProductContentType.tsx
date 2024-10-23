import { TeamMember } from "../models/teams/TeamMembers";
import {Project} from "../projects/Project";
import FeedbackService from "../support/FeedbackService";

// YourProductContentType definition
interface YourProductContentType {
    projectId: Project['id'];
    projectName: Project['name'];
    projectDescription: Project['description'];
    teamMembers: TeamMember[]; // User IDs of team members
    communicationChannels: string[]; // Channels like 'audio', 'video', 'text'
    collaborationOptions: string[]; // Options for collaboration
    currentPhase: string; // Phase of the project (e.g., 'ideation', 'brainstorming', 'launch', 'data-analysis')
    // Add more properties as needed
  }
  
  // Example usage in your app
  const projectContent: YourProductContentType = {
    projectId: 'project123',
    projectName: 'Awesome Project',
    projectDescription: 'A project to create something amazing!',
      teamMembers: [
          
      ],
    communicationChannels: ['audio', 'video', 'text'],
    collaborationOptions: ['task-board', 'file-sharing', 'realtime-editing'],
    currentPhase: 'ideation',
    // Add more properties as needed
  };
  
  // Usage within your app to process product content
  try {
    const feedbackService = FeedbackService.getInstance();
  
    // Example usage for processing project content
    const productChannel = 'project'; // Specify the project channel
    feedbackService.processProductContent(projectContent, productChannel);
  } catch (error) {
    console.error('Error processing project content:', error);
  }
  

  export type { YourProductContentType };
