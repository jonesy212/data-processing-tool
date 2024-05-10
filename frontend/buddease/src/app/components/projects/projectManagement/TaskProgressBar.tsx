// TaskProgressBar.tsx
import React from "react";
import ProgressBar, { Progress } from "../../models/tracker/ProgressBar";

interface TaskProgressBarProps {
  taskProgress: number; // Task progress value between 0 and 100
  onUpdateProgress: () => void;
}

const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  taskProgress,
  onUpdateProgress,
}) => {
  const taskProgressData: Progress = {
    id: "task-progress",
    current: 0,
    max: 100,
    value: taskProgress,
    label: `Task Progress: ${taskProgress}%`,
  };

  return (
    <div>
      <h3>Task Progress</h3>
      <ProgressBar
        progress={taskProgressData}
        duration={0}
        animationID={""}
        uniqueID={""}
        phase={{
          type: "determinate",
          duration: 0,
        }}
      />
      <button onClick={onUpdateProgress}>Update Progress</button>
    </div>
  );
};

export default TaskProgressBar;
