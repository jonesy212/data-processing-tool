import { useDispatch, useSelector } from 'react-redux';



import {
  addTask,
  completeTask,
  filterTasks,
  removeTask,
  selectTasks,
  sortTasks,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskTitle,
} from '@/app/components/state/redux/slices/TaskSlice';
    
import TaskList from '@/app/components/lists/TaskList';
import DataFilterForm from '@/app/components/models/data/DataFilterForm';
import { Task } from '@/app/components/models/tasks/Task';
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

  const handleUpdateTaskTitle = (taskId: string, updatedTitle: Task) => {
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
      <DataFilterForm options={options} onSubmit={handleFilterTasks} />
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
