import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import TaskDetails, { Task } from "../models/tasks/Task";

interface ProjectListProps {
  tasks: Task[];
}

const ProjectList: React.FC<ProjectListProps> = observer(({ tasks }) => {
  // Explicitly type tasks as an array of Task

  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task: Task) => (
          <li key={task.id}>
            <TaskDetails
              task={task}
              completed={false}
            />
            {/* Render TaskDetails component for each task if needed */}
            <Link to={`/task-project-details/${task.id}`}>
              {task.title} - {task.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default ProjectList;
