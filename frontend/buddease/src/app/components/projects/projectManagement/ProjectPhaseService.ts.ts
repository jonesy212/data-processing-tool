// ProjectPhaseService.ts
class ProjectPhaseService {
    private static instance: ProjectPhaseService;
  
    private constructor() {}
  
    static getInstance(): ProjectPhaseService {
      if (!ProjectPhaseService.instance) {
        ProjectPhaseService.instance = new ProjectPhaseService();
      }
      return ProjectPhaseService.instance;
    }
  
    async fetchProjectPhaseFromBackend(): Promise<string> {
      // Make an API call to the backend to get the current project phase
      // Use fetch or your preferred HTTP library
      const response = await fetch('/api/project/phase');
      const data = await response.json();
      return data.phase;
    }
  
    // Add more methods as needed
  }
  
  const projectPhaseService = ProjectPhaseService.getInstance();
  export default projectPhaseService;
  