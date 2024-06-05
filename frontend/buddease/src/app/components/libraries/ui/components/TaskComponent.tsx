import { useDispatch, useSelector } from 'react-redux';
import {
  addTask,
  completeTask,
  filterTasks,
  removeTask,
  selectTasks,
  sortTasks,
  updateTaskStatus,
  updateTaskTitle,
  updateTaskDescription,
} from '@/app/components/state/redux/slices/TaskSlice';
import TaskList from '@/app/components/lists/TaskList';
import DataFilterForm from '@/app/components/models/data/DataFilterForm';
import { Task } from '@/app/components/models/tasks/Task';
import TaskForm from '@/app/components/models/tasks/TaskForm';
import { PaginationOptions, SearchOptions, SortingOption } from '@/app/pages/searchs/SearchOptions';
import { FileTypeEnum } from '@/app/components/documents/FileType';
import { NotificationPreferenceEnum } from '@/app/components/notifications/Notification';
import { CodingLanguageEnum, LanguageEnum } from '@/app/components/communications/LanguageEnum';
import { Filter } from '@/app/pages/searchs/Filter';



interface AdditionalOptions {
  filters?: Filter[];
  sorting?: SortingOption;
  pagination?: PaginationOptions;
  // Add more additional options as needed
}

const TaskComponent = () => {
  const tasks = useSelector(selectTasks);
  const dispatch = useDispatch();

  // Define searchOptions object
  const searchOptions: SearchOptions = {
    size: "medium",
    animations: {
      type: "slide",
      duration: 300,
    },
    additionalOptions: {
      filters: [],
      sorting: {
        field: "title",
        order: "asc",
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
    },
    additionalOption2: undefined,
    communicationMode: "email",
    defaultFileType: FileTypeEnum.UnknownType,
    realTimeUpdates: false,
    theme: "",
    language: LanguageEnum.English,
    notificationPreferences: NotificationPreferenceEnum.Email,
    privacySettings: [],
    taskManagement: false,
    projectView: "",
    calendarSettings: undefined,
    dashboardPreferences: undefined,
    securityFeatures: [],
  };
  const handleAddTask = (newTask: Task) => {
    dispatch(addTask(newTask));
  };

  const handleRemoveTask = (taskId: string) => {
    dispatch(removeTask(taskId));
  };

  const handleCompleteTask = (taskId: string) => {
    dispatch(completeTask(taskId));
  };
  const handleUpdateTaskTitle = (taskId: string, updatedTitle: string) => {
    dispatch(updateTaskTitle({ id: taskId, title: updatedTitle }));
  };

  const handleUpdateTaskDescription = (
    taskId: string,
    updatedDescription: string
  ) => {
    dispatch(
      updateTaskDescription({ id: taskId, description: updatedDescription })
    );
  };

  const handleUpdateTaskStatus = (taskId: string, updatedStatus: string) => {
    dispatch(updateTaskStatus({ id: taskId, status: updatedStatus }));
  };

  const handleFilterTasks = (
    filters: Record<string, { operation: string; value: string | number }>,
    transform: string
  ) => {
    const { userId, query } = filters;
    const filtersObj = { userId, query };
    dispatch(filterTasks(filtersObj));
  };

  const handleSortTasks = (sortType: "asc" | "desc") => {
    dispatch(sortTasks(sortType));
  };

  return (
    <div>
      <h1>Task Management</h1>
      <TaskForm onSubmit={handleAddTask} />
      <DataFilterForm
        options={searchOptions}
        onSubmit={handleFilterTasks}
        onSearch={handleFilterTasks}
      />
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
