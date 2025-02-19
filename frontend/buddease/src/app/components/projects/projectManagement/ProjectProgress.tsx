// ProjectProgress.tsx
import React from "react";
import ProgressBar, { Progress, ProgressPhase } from "../../models/tracker/ProgressBar";

interface ProjectProgressProps {
  projectId: string;
  projectProgress: number; // Project progress value between 0 and 100
  onUpdateProgress: () => void;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({
  projectId,
  projectProgress,
  onUpdateProgress,
}) => {
  const projectProgressData: Progress = {
    id: projectId,
    value: projectProgress,
    label: `Project Progress: ${projectProgress}%`,
    name, color, description, current,
  };

  return (
    <div>
      <h3>Project Progress</h3>
      <ProgressBar
        progress={projectProgressData}
        duration={0}
        animationID={""}
        uniqueID={""}
        phase={{
          type: "determinate",
          duration: 0,
          value: tracker.progress,
        }}
      />
      <button onClick={onUpdateProgress}>Update Progress</button>
    </div>
  );
};
export const projectProgressData: Progress = {} as Progress;
export default ProjectProgress;
export type { ProjectProgressProps };
