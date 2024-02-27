// TaskProjectListings.tsx
import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import { Task } from "../models/tasks/Task";

interface TaskProjectListingsProps {
  tasks: Task[];
}

const TaskProjectListings: React.FC<TaskProjectListingsProps> = observer(({ tasks }) => {
  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task: Task) => (
          <li key={task.id}>
            <Link to={`/task-project-details/${task.id}`}>
              {task.title} - {task.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TaskProjectListings;
