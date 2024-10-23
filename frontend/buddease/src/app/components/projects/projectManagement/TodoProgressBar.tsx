// TodoProgressBar.tsx
import React from "react";
import ProgressBar, { Progress, ProgressPhase } from "../../models/tracker/ProgressBar";

interface TodoProgressBarProps {
  todoProgress: number; // Todo progress value between 0 and 100
  onUpdateProgress: () => void;
}

const TodoProgressBar: React.FC<TodoProgressBarProps> = ({
  todoProgress,
  onUpdateProgress,
}) => {
  const todoProgressData: Progress = {
    value: todoProgress,
    label: `Todo Progress: ${todoProgress}%`,
  };


  const handleProgressID = () => {
    onUpdateProgress();
  }
  return (
    <div>
      <h3>Todo Progress</h3>
      <ProgressBar
        progress={todoProgressData}
        duration={0}
        animationID={""}
        uniqueID={""}
        phase={{} as ProgressPhase}
      />
      <button onClick={onUpdateProgress}>Update Progress</button>
    </div>
  );
};

export default TodoProgressBar;
