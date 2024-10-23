// useTaskManagement.ts
import { addTask, fetchTask, fetchTasks } from '@/app/api/TasksApi';
import { useEffect } from 'react';
import { Task } from '../models/tasks/Task';
import { useTaskManagerStore } from '../state/stores/TaskStore ';

const useTaskManagement = (newTask: Task) => {
  const taskManagerStore = useTaskManagerStore();

  useEffect(() => {
    // Fetch task only on initial component mount
    if (!taskManagerStore.taskDescription.length) {
      taskManagerStore.fetchTasksRequest();
      const taskIds = taskManagerStore.tasks.map((task: Task) => task.id);
      if (!taskIds.includes(newTask.id)) {
        // Use fetchTask with a single task ID, not an array of task IDs
        fetchTask(newTask.id)
          .then((task) => {
            taskManagerStore.fetchTasksSuccess({ tasks: [task] });
          })
          .catch((error) => {
            taskManagerStore.fetchTasksFailure({ error: error.message });
          });
      }
    }

    // Fetch tasks only on initial component mount
    if (!taskManagerStore.tasks.length) {
      fetchTasks()
        .then((tasks) => {
          taskManagerStore.fetchTasksSuccess({ tasks });
        })
        .catch((error) => {
          taskManagerStore.fetchTasksFailure({ error: error.message });
        });
    }

    // Add task only when newTask is provided
    if (newTask.id && !taskManagerStore.tasks.some((task: Task) => task.id === newTask.id)) {
      addTask(newTask as Omit<Task, 'id'>)
        .then((createdTask) => {
          // Ensure addTask returns the created task
          if (createdTask) {
            taskManagerStore.addTaskSuccess({ task: createdTask });
          } else {
            // Handle the case where addTask didn't return the expected task
            console.error('Failed to add task: Created task is undefined');
          }
        })
        .catch((error) => {
          taskManagerStore.addTaskFailure({ error: error.message });
        });
    }
  }, [newTask, taskManagerStore]);

  // Add more methods as needed

  return { taskManagerStore };
};

export default useTaskManagement;
