import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DataFilterForm from './DataFilterForm';
import TaskList from './TaskList';



import {
    updateTaskTitle, 
    selectTasks,
    addTask,
    removeTask,
    completeTask,
    updateTaskDescription,
    updateTaskStatus,
    filterTasks,
    sortTasks,
} from '@/app/components/state/redux/slices/TaskSlice';
    
import TaskForm from '@/app/components/models/tasks/TaskForm';

const TaskComponent = () => {
  const tasks = useSelector(selectTasks);
  const dispatch = useDispatch();

  const handleAddTask = (newTask) => {
    dispatch(addTask(newTask));
  };

  const handleRemoveTask = (taskId) => {
    dispatch(removeTask(taskId));
  };

  const handleCompleteTask = (taskId) => {
    dispatch(completeTask(taskId));
  };

  const handleUpdateTaskTitle = (taskId, updatedTitle) => {
    dispatch(updateTaskTitle({ taskId, updatedTitle }));
  };

  const handleUpdateTaskDescription = (taskId, updatedDescription) => {
    dispatch(updateTaskDescription({ taskId, updatedDescription }));
  };

  const handleUpdateTaskStatus = (taskId, updatedStatus) => {
    dispatch(updateTaskStatus({ taskId, updatedStatus }));
  };

  const handleFilterTasks = (filters) => {
    dispatch(filterTasks(filters));
  };

  const handleSortTasks = (sortType) => {
    dispatch(sortTasks(sortType));
  };

  return (
    <div>
      <h1>Task Management</h1>
      <TaskForm onSubmit={handleAddTask} />
      <DataFilterForm onSubmit={handleFilterTasks} />
      <TaskList
        tasks={tasks}
        onRemoveTask={handleRemoveTask}
        onCompleteTask={handleCompleteTask}
        onUpdateTaskTitle={handleUpdateTaskTitle}
        onUpdateTaskDescription={handleUpdateTaskDescription}
        onUpdateTaskStatus={handleUpdateTaskStatus}
      />
    </div>
  );
};

export default TaskComponent;
