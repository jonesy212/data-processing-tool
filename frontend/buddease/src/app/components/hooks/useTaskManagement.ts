// useTaskManagement.ts
import { useEffect, useState } from 'react';
import { Task } from '../models/tasks/Task';

const useTaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const tasksData = await response.json();
        setTasks(tasksData.tasks);
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
        setTasks((prevTasks) => [...prevTasks, createdTask]);
      } else {
        console.error('Failed to add task:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
    
   
  };

  // Add more methods as needed

  return { tasks, addTask };
};

export default useTaskManagement;
