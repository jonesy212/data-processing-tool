import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import TaskDetails, { Task } from "../models/tasks/Task";

interface TaskListProps {
  tasks?: Task[];
  onRemoveTask?: (task: Task) => void;
  onCompleteTask?: (task: Task) => void;
  onUpdateTaskTitle?: (taskId: string, updatedTitle: Task) => void;
  onUpdateTaskDescription?: (task: Task) => void;
  onUpdateTaskStatus?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = observer(({ tasks = [] }) => {
  // Explicitly type tasks as an array of Task

  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task: Task) => (
          <li key={task.id}>
            <Link to={`/task-project-details/${task.id}`}>
              {/* Render TaskDetails component for each task if needed */}
              {task.title} - {task.status}
            </Link>
            {task.details && <TaskDetails task={task} />}{" "}
            {/* Only render TaskDetails if details exists */}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TaskList;
