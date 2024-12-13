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
  onSortTasks?: (field: string, order: "asc" | "desc") => void;
}

const TaskList: React.FC<TaskListProps> = observer(({ tasks = [] }) => {
  // Explicitly type tasks as an array of Task

  // Filter tasks into scheduled and unscheduled
  const scheduledTasks = tasks.filter((task) => task.isScheduled);
  const unscheduledTasks = tasks.filter((task) => !task.isScheduled);


   // Sort tasks by priority (optional)
   const sortTasksByPriority = (tasks: Task[]) =>
    tasks.sort((a, b) => {
    const priorityOrder = {
      low: 1,
      medium: 2,
      high: 3,
      scheduled: 4,
      completed: 5,
    };
    return (priorityOrder[b.priority || "low"] - priorityOrder[a.priority || "low"]);
  });


  
  return (
    <div>
      {/* Scheduled Tasks Section */}
      <h2>Scheduled Task List</h2>
      <ul>
        {sortTasksByPriority(scheduledTasks).map((task) => (
          <li key={task.id}>
            <Link to={`/task-project-details/${task.id}`}>
              {task.title} - {task.priority?.toUpperCase()} - {task.status}
            </Link>
            {task.scheduledDate && <span> (Scheduled: {task.scheduledDate.toLocaleDateString()})</span>}
            {task.details && <TaskDetails task={task} completed={task.completed} />}
          </li>
        ))}
      </ul>

      {/* Unscheduled Tasks Section */}
      <h2>Unscheduled Task List</h2>
      <ul>
        {sortTasksByPriority(unscheduledTasks).map((task) => (
          <li key={task.id}>
            <Link to={`/task-project-details/${task.id}`}>
              {task.title} - {task.priority?.toUpperCase()} - {task.status}
            </Link>
            {task.details && <TaskDetails task={task} completed={task.completed} />}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TaskList;
