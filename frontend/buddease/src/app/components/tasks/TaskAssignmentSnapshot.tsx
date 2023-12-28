// TaskManagerComponent.tsx
import React, { useEffect, useState } from 'react';
import { useTaskManagerStore } from '../state/stores/TaskStore ';
import TaskAssignmentSnapshot from './TaskAssignmentSnapshot';


interface TaskAssignmentSnapshotProps { 
    taskId: () => string;
}


const TaskManagerComponent: React.FC<TaskAssignmentSnapshotProps> = ({taskId}) => {
  const taskManagerStore = useTaskManagerStore();
  const [localState, setLocalState] = useState<string>('');

  // Component-specific logic using localState
  const handleLocalStateChange = (newValue: string) => {
    setLocalState(newValue);
  };

  useEffect(() => {
    // Update global state when local state changes
    taskManagerStore.updateTaskTitle(localState);
  }, [localState, taskManagerStore]);

  return (
    <div>
      <input
        type="text"
        value={localState}
        onChange={(e) => handleLocalStateChange(e.target.value)}
      />
      <p>Task Title: {taskManagerStore.taskTitle}</p>
      <TaskAssignmentSnapshot taskId={taskId} />
      {/* JSX for the rest of the component */}
    </div>
  );
};

export default TaskManagerComponent;
