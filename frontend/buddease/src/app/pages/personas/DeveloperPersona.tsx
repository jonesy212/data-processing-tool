// DeveloperPersona.tsx
// Define attributes and permissions for Developer persona
interface DeveloperPersona {
    name: string;
    role: string;
    experience: string;
    permissions: {
      canViewBugs: boolean;
      canCreateBug: boolean;
      canUpdateBugStatus: boolean;
      canCollaborateOnBugs: boolean;
      canViewBugSeverityImpact: boolean;
      canViewBugResolutionHistory: boolean;
    };
  }
  
  // Define a sample Developer persona
  const developerPersona: DeveloperPersona = {
    name: "Alex",
    role: "Software Developer",
    experience: "Mid-level developer with experience in frontend and backend development.",
    permissions: {
      canViewBugs: true,
      canCreateBug: true,
      canUpdateBugStatus: true,
      canCollaborateOnBugs: true,
      canViewBugSeverityImpact: true,
      canViewBugResolutionHistory: true,
    },
  };
  
  export default developerPersona;
