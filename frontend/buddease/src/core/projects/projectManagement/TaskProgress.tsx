// TaskProgress.tsx
// TodoProgress.tsx
import ListGenerator from "@/core/generators/ListGenerator";
import { Data } from '@/core/models/data/Data';
import { Task } from "@/core/models/tasks/Task";
import { DetailsItem } from "@/core/state/stores/DetailsListStore";
import React from "react";

interface TaskProgressProps {
  taskProgress: DetailsItem<Data>[]; // Ensure DetailsItem type is imported and defined correctly
  selectedTask: Task; // Add task prop
  newProgress: number; // Add newProgress prop
  onUpdateProgress: (newProgress: number) => void;
  onTaskClick: (task: Task) => void;
  handleTaskClick?: () => void;
}

const TaskProgress: React.FC<TaskProgressProps> = ({
  taskProgress,
  selectedTask,
  newProgress,
  onUpdateProgress,
  onTaskClick,
}) => {
  // Define function to handle progress update
  const handleUpdateProgress = () => {
    onUpdateProgress(newProgress);
  };

  const handleTaskClick = () => {
    if (selectedTask) {
      onTaskClick(selectedTask);
    }
  };

  return (
    <div>
      <h3>Task Progress</h3>
      {/* Render the list of tasks */}
      <ListGenerator items={taskProgress} />
      {/* Render the button to update progress */}
      {/* Pass the handleUpdateProgress function as the onClick event handler */}
      <button onClick={handleUpdateProgress}>Update Progress</button>
      {/* Render the button to update task */}
      <button onClick={handleTaskClick}>Update Task</button>
    </div>
  );
};

export default TaskProgress;
