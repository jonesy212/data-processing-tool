// TaskAssignmentSnapshot.tsx
import React, { useState } from 'react';
import { useTaskManagerStore } from '../state/stores/TaskStore ';

interface TaskAssignmentSnapshotProps {
  taskId: string;
}


const TaskAssignmentSnapshot: React.FC<TaskAssignmentSnapshotProps> = ({ taskId }) => {
  const taskManagerStore = useTaskManagerStore();
  const [assignedTo, setAssignedTo] = useState<string>(''); // You can change the type based on your user/team structure

  const assignTask = () => {
    // Perform the task assignment logic here
    taskManagerStore.assignedTaskStore.assignTask(taskId, assignedTo);
  };
  

  const takeSnapshot = () => {
    // Perform the snapshot logic here

    
    taskManagerStore.takeTaskSnapshot(taskId);
  };

  return (
    <div>
      <label>
        Assign To:
        <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
      </label>
      <button onClick={assignTask}>Assign Task</button>
      <button onClick={takeSnapshot}>Take Snapshot</button>
    </div>
  );
};

export default TaskAssignmentSnapshot;
