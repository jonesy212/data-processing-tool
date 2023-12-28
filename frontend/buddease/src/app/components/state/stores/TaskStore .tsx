//TaskManagerStore.tsx
import { generateNewTask } from "@/app/generators/GenerateNewTask";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Task } from "../../models/tasks/Task";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { AssignTaskStore, useAssignTaskStore } from "./AssignTaskStore";

export interface TaskManagerStore {
  tasks: Record<string, Task[]>;
  taskTitle: string;
  taskDescription: string;
  taskStatus: "pending" | "inProgress" | "completed";
  assignedTaskStore: AssignTaskStore;
  updateTaskTitle: (title: string) => void;
  updateTaskDescription: (description: string) => void;
  updateTaskStatus: (status: "pending" | "inProgress" | "completed") => void;
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;
  removeTask: (taskId: string) => void;
  removeTasks: (taskIds: string[]) => void; 
  fetchTasksSuccess: (payload: { tasks: Task[] }) => void; 
  fetchTasksFailure: (payload: { error: string }) => void;  
  fetchTasksRequest: () => void; 
  completeAllTasksSuccess: () => void; 
  completeAllTasks: () => void; 
  completeAllTasksFailure: (payload: { error: string }) => void; 
  NOTIFICATION_MESSAGE: string; 
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES,
  setDynamicNotificationMessage: (message: string) => void;  

  // Add more methods or properties as needed
}

const useTaskManagerStore = (): TaskManagerStore => {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    pending: [],
    inProgress: [],
    completed: []
  });
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<
  
    "pending" | "inProgress" | "completed"
  >("pending");
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>(''); // Initialize it with an empty string

    // Include the AssignTaskStore
    const assignedTaskStore = useAssignTaskStore();

  // Method to reassign a task to a new user
  const reassignTask = (taskId: string, oldUserId: string, newUserId: string) => {
    assignedTaskStore.reassignUser(taskId, oldUserId, newUserId);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  };

  const updateTaskTitle = (title: string) => {
    setTaskTitle(title);
  };

  const updateTaskDescription = (description: string) => {
    setTaskDescription(description);
  };

  const updateTaskStatus = (status: "pending" | "inProgress" | "completed") => {
    setTaskStatus(status);
  };

  const addTask = () => {
    // Ensure the title is not empty before adding a task
    if (taskTitle.trim().length === 0) {
      console.error("Task title cannot be empty.");
      return;
    }
    
    const newTask = generateNewTask();

    // Ensure the title is not empty before adding a task
    if (taskTitle.trim().length === 0) {
      console.error("Task title cannot be empty.");
      return;
    }

    newTask.then((task) => {
      setTasks((prevTasks) => {
        const taskId = task.id;
        return { ...prevTasks, [taskId]: [...(prevTasks[taskId] || []), task] };
      });
    });



    

    // Reset input fields after adding a task
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("pending");
  };

  const removeTask = (taskId: string) => {
    setTasks((prevTasks: Record<string, Task[]>) => {
      const updatedTasks = { ...prevTasks };
      delete updatedTasks[taskId];
      return updatedTasks;
    });
  };


  const removeTasks = (taskIds: string[]) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      taskIds.forEach((taskId) => {
        delete updatedTasks[taskId];
      });
      return updatedTasks;
    });
  };




  const addTasks = (tasksToAdd: Task[]) => {
    // Ensure at least one task is passed
    if (tasksToAdd.length === 0) {
      console.error("At least one task must be passed");
      return;
    }

    setTasks((prevTasks) => {
      tasksToAdd.forEach((task) => {
        const taskId = task.id;
        prevTasks[taskId] = [...(prevTasks[taskId] || []), task];
      });
      return prevTasks;
    });

    // Reset input fields after adding tasks
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("pending");
  };


  const fetchTasksSuccess = (payload: { tasks: Task[] }) => {
    const { tasks: newTasks } = payload;
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      
      newTasks.forEach((task) => {
        if (!prevTasks[task.id]) {
          prevTasks[task.id] = [];  
        }
        prevTasks[task.id].push(task);
      });
      
      return updatedTasks;
    });
  };


  const completeAllTasksSuccess = () => {
    console.log("All Tasks completed successfully!");
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  };

  const completeAllTasks = () => {
    console.log("Completing all Tasks...");
    // You can add loading indicators or other UI updates here

    // Simulate asynchronous completion
    setTimeout(() => {
      // Update tasks to mark all as done
      setTasks((prevTasks: Record<string, Task[]>) => {
        const updatedTasks = { ...prevTasks };
        Object.keys(updatedTasks).forEach((id) => {
          updatedTasks[id] = prevTasks[id].map((task) => ({
            ...task,
            done: true,
          }));
        });
        return updatedTasks;
      });

      // Trigger success
      completeAllTasksSuccess();
    }, 1000);
  };



  const fetchTasksFailure = (payload: { error: string }) => {
    console.error("Fetch Tasks Failure:", payload.error);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA);
  };

  const fetchTasksRequest = () => {
    console.log("Fetching Tasks...");
    // You can add loading indicators or other UI updates here
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.DataLoading.PAGE_LOADING);
  };

  const completeAllTasksFailure = (payload: { error: string }) => {
    console.error("Complete All Tasks Failure:", payload.error);
    // You can add additional error handling or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH);
  };

  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setNotificationMessage(message);
  };



  




  // Add more methods or properties as needed

  makeAutoObservable({
    tasks,
    ...tasks,
     taskTitle,
    taskDescription,
    taskStatus,
    assignedTaskStore,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    addTask,
    addTasks,
    removeTask,
    removeTasks,
    reassignTask,
    fetchTasksSuccess,
    fetchTasksFailure,
    fetchTasksRequest,
    completeAllTasksSuccess,
    completeAllTasks,
    completeAllTasksFailure,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    setDynamicNotificationMessage
  })

  return {
    tasks,
    ...tasks,
    taskTitle,
    taskDescription,
    taskStatus,
    assignedTaskStore,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    addTask,
    addTasks,
    removeTask,
    removeTasks,
    fetchTasksSuccess,
    fetchTasksFailure,
    fetchTasksRequest,
    completeAllTasksSuccess,
    completeAllTasks,
    completeAllTasksFailure,
    setDynamicNotificationMessage
    // Add more methods or properties as needed
  };
};


export { useTaskManagerStore };

