// TaskLoop.tsx
import React from 'react';
import { Task } from '../models/tasks/Task';

// Default alias for Task with all generics filled in
type DefaultTask = Task<any, any, any, any>;

interface TaskLoopProps {
  task: DefaultTask; // Use the default alias here
  taskType: string;
  attachmentUrls?: string[];
}

const TaskLoop: React.FC<TaskLoopProps> = ({
  task,
  taskType,
  attachmentUrls,
}) => {
  return (
    <div>
      <h2>Task Loop</h2>
      <p>{task.toString()}</p>

      {taskType === "text" && <p>This is a text task</p>}

      {taskType === "image" && attachmentUrls?.length > 0 && (
        <div>
          <p>This is an image task with attachments:</p>
          <ul>
            {attachmentUrls.map((url, index) => (
              <li key={index}>
                <img src={url} alt={`Attachment ${index + 1}`} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskLoop;
