ProjectPlanningPage.tsx
// Example usage in another component or page
import IdeaLifecycleComponent from '@/core/pages/projects/IdeaLifecycleComponent'; // Added semicolon here
import React from 'react';

const ProjectPlanningPage: React.FC = () => {
  return (
    <div>
      <h1>Project Planning</h1>
      {/* Other project planning content */}
      
      {/* Include IdeaLifecycleComponent to show phases */}
      <IdeaLifecycleComponent />
    </div>
  );
};

export default ProjectPlanningPage; // Don't forget to export