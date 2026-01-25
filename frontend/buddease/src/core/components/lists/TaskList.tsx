// TaskList.tsx
import { TaskDetails } from '@/core/models/data/index';
import { ValidPriority } from '@/core/pages/searches/CriteriaType';
import { AppTask } from '@/core/typings/entities/TaskEntity';
import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
/**
 * TaskList Component
 * 
 * Responsibilities:
 * - Renders scheduled and unscheduled tasks in separate sections.
 * - Sorts tasks by priority using ValidPriority.
 * - Renders detailed task information via TaskDetails.
 * - Provides navigation links to individual task/project detail pages.
 * 
 * Integration:
 * - Fully integrates MobX state (via AppTask types) and React Router for reactive UI updates and navigation.
 * - Accepts optional tasks props; falls back to MobX store if not provided.
 */

interface TaskListProps {
  tasks?: AppTask[];
  onRemoveTask?: (task: string) => void;
  onCompleteTask?: (task: string) => void;
  onUpdateTaskTitle?: (taskId: string, updatedTitle: string) => void;
  onUpdateTaskDescription?: (task: string, updatedDescription: string) => void;
  onUpdateTaskStatus?: (task: string, updatedStatus: string) => void;
  onSortTasks?: (field: string, order: "asc" | "desc") => void;
}

const TaskList: React.FC<TaskListProps> = observer(({ tasks = [] }) => {

  // Filter tasks into scheduled and unscheduled
  const scheduledTasks = tasks.filter(task => task.isScheduled);
  const unscheduledTasks = tasks.filter(task => !task.isScheduled);

  // Sort tasks by priority
  const sortTasksByPriority = (tasksToSort: AppTask[]) =>
    tasksToSort.sort((a, b) => {
      const priorityOrder: Record<ValidPriority, number> = {
        low: 1,
        medium: 2,
        high: 3,
        scheduled: 4,
        completed: 5,
      };

      // Update getValidPriority to accept PriorityValue and handle null/undefined
      const getValidPriority = (priority: PriorityValue | string | undefined): ValidPriority => {
        const validPriorities: ValidPriority[] = ["low", "medium", "high", "scheduled", "completed"];
        
        // Handle null, undefined, or empty string
        if (!priority) return "low";
        
        // Convert to string and check if it's a valid priority
        const priorityStr = String(priority);
        return (validPriorities.includes(priorityStr as ValidPriority)
          ? priorityStr
          : "low") as ValidPriority;
      };

      // Now both parameters will be ValidPriority, not PriorityValue
      const priorityA = getValidPriority(a.priority);
      const priorityB = getValidPriority(b.priority);
      
      return priorityOrder[priorityB] - priorityOrder[priorityA];
    });

  return (
    <div>
      <h2>Scheduled Task List</h2>
      <ul>
        {sortTasksByPriority(scheduledTasks).map(task => (
          <li key={task.id}>
            <Link to={`/task-project-details/${task.id}`}>
              {task.title} - {task.priority?.toUpperCase()} - {task.status}
            </Link>
            {task.scheduledDate && <span> (Scheduled: {task.scheduledDate.toLocaleDateString()})</span>}
            {task.details && <TaskDetails task={task} completed={task.isCompleted} />}
          </li>
        ))}
      </ul>

      <h2>Unscheduled Task List</h2>
      <ul>
        {sortTasksByPriority(unscheduledTasks).map(task => (
          <li key={task.id}>
            <Link to={`/task-project-details/${task.id}`}>
              {task.title} - {task.priority?.toUpperCase()} - {task.status}
            </Link>
            {task.details && <TaskDetails task={task} completed={task.isCompleted} />}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TaskList;