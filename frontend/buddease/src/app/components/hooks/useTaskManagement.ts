// useTaskManagement.ts
import { useEffect } from 'react';
import { Task } from '../models/tasks/Task';
import { useTaskManagerStore } from '../state/stores/TaskStore ';

const useTaskManagement = () => {
  const taskManagerStore = useTaskManagerStore();

  useEffect(() => {
    taskManagerStore.fetchTasksRequest();

    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const tasksData = await response.json();
        taskManagerStore.fetchTasksSuccess({ tasks: tasksData.tasks });
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const createdTask: Task = await response.json();
        taskManagerStore.addTaskSuccess({task: createdTask});
      } else {
        console.error('Failed to add task:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
    
   
  };

  // Add more methods as needed

  return { taskManagerStore, addTask };
};

export default useTaskManagement;
