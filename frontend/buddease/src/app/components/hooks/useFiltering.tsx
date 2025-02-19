import endpointConfigurations from '@/app/api/endpointConfigurations';
import { Task } from '@/app/components/models/tasks/Task';
import { SearchOptions } from '@/app/pages/searchs/SearchOptions';
import { Action, ThunkAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Dispatch, useState } from 'react';
import { TaskActions } from '../actions/TaskActions';
import { PriorityTypeEnum } from '../models/data/StatusType';
import { RootState } from '../state/redux/slices/RootSlice';


// Reusable filtering logic
function useFiltering(options: SearchOptions) {
  const [filters, setFilters] = useState<SearchOptions['additionalOptions']['filters']>([]);
  const [transform, setTransform] = useState("none");

  const addFilter = (
    column: string,
    operation: 'equal' | 'notEqual' | 'contains' | 'notContains',
    value: string | number | boolean
  ) => {
    // Logic to add filter
    setFilters((prevFilters) => [
      ...(prevFilters || []),
      { name: column, operation, value },
    ]);
  };

  const filterTasksEndpoint = endpointConfigurations.filtering.filterTasks;
  const searchMessagesEndpoint = endpointConfigurations.searching.searchMessages;

  const handleFilterTasks = (
    filters: SearchOptions["additionalOptions"]["filters"],
    transform: string
  ) => {
    // Call API to filter tasks
    return axios.post(filterTasksEndpoint.path, { filters, transform });
  };

  const handleSearchMessages = (
    filters: SearchOptions["additionalOptions"]["filters"],
    transform: string
  ) => {
    // Call API to search messages
    return axios.post(searchMessagesEndpoint.path, { filters, transform });
  };

  const handleSubmit = () => {
    // Logic to handle form submission for filtering tasks
    handleFilterTasks(filters, transform)
      .then(response => {
        console.log('Tasks filtered successfully:', response.data);
        // TODO: Update state with filtered data, or notify the user
      })
      .catch(error => {
        console.error('Error filtering tasks:', error);
        // TODO: Add better error handling and user notification
      });
  };

  const handleSearchSubmit = () => {
    // Logic to handle form submission for searching messages
    handleSearchMessages(filters, transform)
      .then(response => {
        console.log('Messages searched successfully:', response.data);
        // TODO: Update state with searched data, or notify the user
      })
      .catch(error => {
        console.error('Error searching messages:', error);
        // TODO: Add better error handling and user notification
      });
  };

  // Example usage within the hook
  const exampleUsage = () => {
    const column = "status";
    const operation = "equal";
    const value = "completed";
    
    addFilter(column, operation, value);

    handleSubmit(); // For filtering tasks
    // handleSearchSubmit(); // Uncomment this line to search messages instead
  };

  // Call example usage (this is just to demonstrate, you might not call it like this in actual code)
  exampleUsage(); // TODO: Remove this in production

  return { addFilter, handleSubmit, handleSearchSubmit, filters, transform, setTransform };
}


 
const updateTaskPriority = (
  taskId: Task["id"],
  priority: PriorityTypeEnum
): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch: Dispatch<Action<string>>, getState: () => RootState) => {
    try {
      // Get the full task object from the state
      const state = getState();
      const task: Task | undefined = state.taskManager.tasks.find(
        (task: Task) => task.id === taskId
      );

      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }
 
      setTasks((prevTasks: Record<PriorityTypeEnum, Task[]>): Record<PriorityTypeEnum, Task[]> => {
        const updatedTasks = { ...prevTasks };
        
        // Ensure taskId is of type PriorityTypeEnum
        const taskToUpdate = updatedTasks[taskId as PriorityTypeEnum]; // Add 'as PriorityTypeEnum' to assert type
        
        if (taskToUpdate) {
          const updatedTask = taskToUpdate.map((task) => {
            if (task.id === taskId) {
              return { ...task, priority };
            }
            return task;
          });
          updatedTasks[taskId as PriorityTypeEnum] = updatedTask; // Add 'as PriorityTypeEnum' to assert type
        }
        return updatedTasks;
      });
      
      // Dispatch the action with the full task object
      dispatch(
        TaskActions.updateTaskPrioritySuccess({
          taskId: {} as Task,
          priority,
        })
      );
    } catch (error: any) {
      console.error("Error updating task priority:", error);
      // Dispatch any necessary error actions here
      // Example: 
      dispatch( TaskActions.updateTaskPriorityFailure({taskId, error}));
    }
  };

export default useFiltering;
function setTasks(arg0: (prevTasks: Record<string, Task[]>) => { [x: string]: Task[]; }) {
  const prevTasks = arg0;
  return prevTasks;
}

