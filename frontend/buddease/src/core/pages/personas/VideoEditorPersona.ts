// VideoEditorPersona.ts

// Define attributes and permissions for Video Editor persona
interface VideoEditorPersona {
    name: string;
    role: string;
    permissions: {
      canEditVideos: boolean;
      canCollaborateOnProjects: boolean;
      canShareEditedVideos: boolean;
      canProvideFeedback: boolean;
      canParticipateInCommunityProjects: boolean;
      canEarnRewards: boolean;
    };
  }
  
  // Define a sample Video Editor persona
  const videoEditorPersona: VideoEditorPersona = {
    name: "John Doe",
    role: "Video Editor",
    permissions: {
      canEditVideos: true,
      canCollaborateOnProjects: true,
      canShareEditedVideos: true,
      canProvideFeedback: true,
      canParticipateInCommunityProjects: true,
      canEarnRewards: true,
    },
  };
  
  export default videoEditorPersona;
  