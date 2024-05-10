// TaskLoop.tsx
import React from 'react';
import { Task } from '../models/tasks/Task';

interface TaskLoopProps {
  task: Task;
  taskType: string;
  // Define any additional props needed for tasks, such as URLs for attachments
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
      {/* Render additional content based on task type or other properties */}
      {taskType === "text" && (
        <p>This is a text task</p>
      )}
      {taskType === "image" && attachmentUrls && attachmentUrls.length > 0 && (
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
      {/* Add more conditions for different task types */}
    </div>
  );
};

export default TaskLoop;
