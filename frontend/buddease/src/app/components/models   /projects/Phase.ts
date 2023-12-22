// Define a type for a phase
interface Phase {
    name: string;
    subPhases: string[];
  }
  
  // Define an array of phases
  const lifecyclePhases: Phase[] = [
    {
      name: 'Idea Lifecycle',
      subPhases: ['Idea', 'Team Building', 'Ideation'],
    },
    {
      name: 'Project Execution',
      subPhases: ['Project Planning', 'Task Management', 'Launch'],
      },
      {
        name: 'UX/UI Design',
        subPhases: ['User Research', 'Wireframing', 'Prototyping', 'Testing'],
      },
      {
        name: 'Development',
        subPhases: ['Planning', 'Coding', 'Testing', 'Deployment'],
      },
    {
      name: 'Post-Launch Activities',
      subPhases: ['Data Analysis', 'Refactoring/Rebranding', 'Collaboration Settings'],
    },
    // Add more phases as needed
  ];
  
  // Function to get sub-phases based on the selected phase name
  function getSubPhases(selectedPhaseName: string): string[] | undefined {
    const selectedPhase = lifecyclePhases.find(phase => phase.name === selectedPhaseName);
    return selectedPhase?.subPhases;
  }
  
  // Example usage:
  const selectedPhaseName = 'Project Execution';
  const subPhases = getSubPhases(selectedPhaseName);
  
  if (subPhases) {
    console.log(`Sub-phases of ${selectedPhaseName}:`, subPhases);
  } else {
    console.log(`Phase "${selectedPhaseName}" not found.`);
  }
  