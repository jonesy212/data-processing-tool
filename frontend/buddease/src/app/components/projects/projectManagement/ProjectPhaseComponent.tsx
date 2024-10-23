// ProjectPhaseComponent.tsx
import React, { useEffect, useState } from "react";
import projectPhaseService from "./ProjectPhaseService.ts";

const ProjectPhaseComponent: React.FC = () => {
  const [projectPhase, setProjectPhase] = useState<string>("");

  useEffect(() => {
    // Fetch project phase data when component mounts
    const fetchProjectPhase = async () => {
      const phase = await projectPhaseService.fetchProjectPhaseFromBackend();
      setProjectPhase(phase);
    };

    fetchProjectPhase();

    // Clean up effect
    return () => {
      // Add any cleanup logic here if needed
    };
  }, []);

  return (
    <div>
      <h1>Current Project Phase: {projectPhase}</h1>
    </div>
  );
};

export default ProjectPhaseComponent;
