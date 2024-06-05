import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import TaskDetails, { Task } from "../models/tasks/Task";

interface TaskListProps {
  tasks?: Task[];
  onRemoveTask?: (task: string) => void;
  onCompleteTask?: (task: string) => void;
  onUpdateTaskTitle?: (taskId: string, updatedTitle: string) => void;
  onUpdateTaskDescription?: (task: string, updatedDescription: string) => void;
  onUpdateTaskStatus?: (task: string, updatedStatus: string) => void;
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
              {task.title} - {task.status}
            </Link>
            {task.details && (
              <TaskDetails task={task} completed={task.completed} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TaskList;
