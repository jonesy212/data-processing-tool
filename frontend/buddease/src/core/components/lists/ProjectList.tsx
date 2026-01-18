// ProjectList.tsx
import type { TaskDetails } from "@/core/models/tasks/Task";
import { ValidPriority } from '@/core/pages/searches/CriteriaType';
import { useProjectManager } from "@/core/state/stores/hooks/useProjectManager";
import { AppTask } from '@/core/typings/entities/TaskEntity';
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * ProjectList Component
 * 
 * Responsibilities:
 * - Fetches tasks from the ProjectManagerStore (MobX store) using `useProjectManager`.
 * - Renders scheduled and unscheduled tasks separately.
 * - Sorts tasks by ValidPriority.
 * - Renders detailed task information via TaskDetails.
 * - Provides navigation links to individual task/project detail pages.
 * 
 * Integration:
 * - Fully integrates MobX state and React Router for reactive UI updates and navigation.
 * - Accepts optional tasks props; falls back to tasks aggregated from all projects in the store.
 */

interface ProjectListProps {
  tasks?: AppTask[];
}

const ProjectList: React.FC<ProjectListProps> = observer(({ tasks }) => {
  const projectManagerStore = useProjectManager();

  // Optional fetch if store is empty
  useEffect(() => {
    if (!projectManagerStore.projects.length) {
      projectManagerStore.fetchProjects();
    }
  }, [projectManagerStore]);

  // Fallback to store tasks if no props provided
  const allTasks = tasks ?? projectManagerStore.projects.flatMap(project => project.tasks || []);

  // Filter tasks into scheduled and unscheduled
  const scheduledTasks = allTasks.filter(task => task.isScheduled);
  const unscheduledTasks = allTasks.filter(task => !task.isScheduled);

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

      const getValidPriority = (priority?: string): ValidPriority => {
        const validPriorities: ValidPriority[] = ["low", "medium", "high", "scheduled", "completed"];
        return (priority && validPriorities.includes(priority as ValidPriority)
          ? priority
          : "low") as ValidPriority;
      };

      return priorityOrder[getValidPriority(b.priority)] - priorityOrder[getValidPriority(a.priority)];
    });

  return (
    <div>
      <h2>Scheduled Project Tasks</h2>
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

      <h2>Unscheduled Project Tasks</h2>
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

export default ProjectList;

/**
 * Usage Notes:
 * - Automatically fetches projects and tasks if store is empty.
 * - Tasks props can be passed or fallback to store tasks.
 * - Uses observer to reactively render changes in project tasks.
 * - Priorities are type-safe via ValidPriority.
 * - Pattern matches TaskList for consistent usage and integration.
 */
