// ProjectProgress.tsx
import React from "react";
import ProgressBar, { Progress, ProgressPhase } from "../../models/tracker/ProgressBar";

interface ProjectProgressProps {
  projectProgress: number; // Project progress value between 0 and 100
  onUpdateProgress: () => void;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({
  projectProgress,
  onUpdateProgress,
}) => {
  const projectProgressData: Progress = {
    value: projectProgress,
    label: `Project Progress: ${projectProgress}%`,
  };

  return (
    <div>
      <h3>Project Progress</h3>
      <ProgressBar
        progress={projectProgressData}
        duration={0}
        animationID={""}
        uniqueID={""}
        phase={{} as ProgressPhase}
      />
      <button onClick={onUpdateProgress}>Update Progress</button>
    </div>
  );
};

export default ProjectProgress;
