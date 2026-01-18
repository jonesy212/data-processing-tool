// UXUIDesignerPersona.ts
// Define attributes and permissions for UX/UI Designer persona
interface UXUIDesignerPersona {
    name: string;
    role: string;
    experience: string;
    permissions: {
      canViewDesignAssets: boolean;
      canCreateDesigns: boolean;
      canCollaborateOnDesignProjects: boolean;
      canProvideFeedbackOnDesigns: boolean;
      canParticipateInDesignReviews: boolean;
      canAccessDesignVersionHistory: boolean;
    };
  }
  
  // Define a sample UX/UI Designer persona
  const uxUiDesignerPersona: UXUIDesignerPersona = {
    name: "Emily",
    role: "UX/UI Designer",
    experience: "Senior designer with extensive experience in user interface and user experience design.",
    permissions: {
      canViewDesignAssets: true,
      canCreateDesigns: true,
      canCollaborateOnDesignProjects: true,
      canProvideFeedbackOnDesigns: true,
      canParticipateInDesignReviews: true,
      canAccessDesignVersionHistory: true,
    },
  };
  
  export default uxUiDesignerPersona;
