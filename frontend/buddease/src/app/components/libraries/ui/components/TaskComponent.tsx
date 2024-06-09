import React from "react";

import { FilterActions } from '@/app/components/actions/FilterActions';
import { LanguageEnum } from '@/app/components/communications/LanguageEnum';
import { FileTypeEnum } from '@/app/components/documents/FileType';
import TaskList from '@/app/components/lists/TaskList';
import DataFilterForm from '@/app/components/models/data/DataFilterForm';
import { Task } from '@/app/components/models/tasks/Task';
import TaskForm from '@/app/components/models/tasks/TaskForm';
import { NotificationPreferenceEnum } from '@/app/components/notifications/Notification';
import {
  addTask,
  completeTask,
  removeTask,
  selectTasks,
  sortTasks,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskTitle,
} from '@/app/components/state/redux/slices/TaskSlice';
import { Filter } from '@/app/pages/searchs/Filter';
import { PaginationOptions, SearchOptions, SortingOption } from '@/app/pages/searchs/SearchOptions';
import { useDispatch, useSelector } from 'react-redux';


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
    return new Promise<void>((resolve, reject) => {
      const { userId, query } = filters;
      const filtersObj = { userId, query };

      // Dispatch the filterTasks action with the appropriate payload
      dispatch(
        FilterActions.filterTasks({
          userId: filtersObj.userId,
          query: filtersObj.query,
        })
      );

      // Resolve the promise after dispatching the action
      resolve();
    });
  };
  

  const handleSortTasks = (field: string, order: "asc" | "desc") => {
    dispatch(sortTasks({ field, order }));
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
        tasks={tasks.payload}
        onRemoveTask={handleRemoveTask}
        onCompleteTask={handleCompleteTask}
        onUpdateTaskTitle={handleUpdateTaskTitle}
        onUpdateTaskDescription={handleUpdateTaskDescription}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onSortTasks={handleSortTasks}  

      />
    </div>
  );
};

export default TaskComponent;
