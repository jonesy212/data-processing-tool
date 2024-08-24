// MonthView.jsx
import TaskList from "@/app/components/lists/TaskList";
import { Project } from "@/app/components/projects/Project";
import React from "react";
import { Task } from "../models/tasks/Task";
import { CommonCalendarProps } from "./Calendar";
import CalendarMonth from "./CalendarMonth";
import CryptoTransaction from "../crypto/CryptoTransaction";
import { ContentPost } from "../models/content/ContentPost";
import { RootState } from "../state/redux/slices/RootSlice";
import { rootStores } from "../state/stores/RootStores";
import { TaskActions } from "../actions/TaskActions";
import { useDispatch } from "react-redux";
import {
  dropTask,
  resizeTask,
 
  updateTaskPositionAsync,
} from "../state/redux/slices/TaskSlice";
import { updateTask } from "../state/redux/slices/CollaborationSlice";
import { Action, Dispatch, ThunkAction } from "@reduxjs/toolkit";
// import CalendarMonth from './CalendarMonthView';
 import { MonthInfo } from "./Month";
import { YearInfo } from "./CalendarYear";
import * as taskApi from "@/app/api/TasksApi";
import { NOTIFICATION_TYPES } from "../support/NotificationTypes";
import { TaskState } from "../state/redux/slices/TaskSlice";
import { PriorityTypeEnum } from "../models/data/StatusType";

import useNotification from "../support/NotificationContext";
import { updateTaskDetails } from "../state/redux/slices/ContentSlice";

const {notify} = useNotification;
interface MonthViewProps extends CommonCalendarProps {
  selectedProject: (state: RootState, projectId: string) => Project | null;
  month: MonthInfo[]; // Add month prop
  year: YearInfo[]; // Add year prop

  tasks: Task[];
  events: any[];
  milestones: any[];
  projectId: string; // Add projectId prop
}

const MonthView: React.FC<MonthViewProps> = ({
  month,
  year,
  tasks,
  events,
  milestones,
  selectedProject,
  projectId,
  onAudioCallStart,
  onAudioCallEnd,
  onVideoCallStart,
  onVideoCallEnd,
  ...taskHandlers
}) => {
  // Assuming you have access to the root state of your application and projectId is defined
  const state: RootState = rootStores.calendarStore.getState(); // Get the root state
  const dispatch = useDispatch();
  const selectedProjectData = selectedProject
    ? selectedProject(state, projectId)
    : null; // Call the function to get the Project object if selectedProject is not null

  const handleTaskClick = (task: Task) => {
    // Handle task click
    alert(`Task Clicked: ${task.title}`);
    console.log("Task clicked:", task);
  };

  const handleTaskDoubleClick = (task: Task) => {
    // Handle task double click
    alert(`Task Double Clicked: ${task.title}`);
    console.log("Task double-clicked:", task);
  };

  const handleonTaskContextMenu = (task: Task, event: React.MouseEvent) => {
    // Handle task context menu
    event.preventDefault(); // Prevent the default context menu
    alert(`Task Context Menu: ${task.title}`);
    console.log("Task context menu:", task);
  };

  const handleTaskContextMenu = (task: Task, event: React.MouseEvent) => {
    // Handle task context menu
    event.preventDefault(); // Prevent the default context menu
    alert(`Task Context Menu: ${task.title}`);
    console.log("Task context menu:", task);
  };

  const handleTaskDragStart = (task: Task) => {
    // Handle task drag start
    console.log(task);
  };

  // Define the updateTaskPosition action

// Define the Thunk action
const updateTaskPosition = (
  taskId: string,
  newPosition: number
): ThunkAction<void, RootState, unknown, Action<string>> => {
  return async (dispatch: Dispatch<Action<string>>, getState: () => RootState) => {
    try {
      // Make an API call to update the task's position in the database
      await taskApi.updateTaskPosition(taskId, newPosition, dispatch, notify());

      // Dispatch an action to update the task's position in the Redux state
      dispatch(updateTaskPositionSuccess(taskId, newPosition));
    } catch (error) {
      // Handle error, if any
      console.error('Error updating task position:', error);
    }
  };
};


  const updateTaskPositionSuccess = (taskId: string, newPosition: number) => ({
    type: NOTIFICATION_TYPES.TASK_UPDATED,
    payload: { taskId, newPosition },
  });

  const onTaskResize = (task: Task, newSize: number) => {
    // Handle task resize
    console.log(task, newSize);
    dispatch(resizeTask({ task, newSize }));
  };

  // handleOnTaskChange function logic
  const handleOnTaskChange = (task: Task, updatedDetails: Task) => {
    // Implement logic for handling task change
    console.log("Task changed:", task);
    console.log("Updated details:", updatedDetails);
    // Add your custom logic here
    // For example, you might want to update the task's details in the database
    // Or trigger a Redux action to update the task's details in the state

    // Example of updating task details in Redux state
    dispatch(updateTaskDetails({ id: task.id, updates: updatedDetails }));
  };



  const handleOnTaskDrop = (task: Task, newPosition: { [key: string]: number }) => {
    const dispatch = useDispatch();
  
    // Implement logic for handling task drop
    console.log('Task dropped:', task);
  
    // Example of updating task position in Redux state
    dispatch(updateTaskPositionAsync(task.id, newPosition));
  };


  const handleEventClick = (event: any) => {
    alert(`Event Clicked: ${event.title}`);
    console.log("Event clicked:", event);
  };

  const handleMilestoneClick = (milestone: any) => {
    alert(`Milestone Clicked: ${milestone.title}`);
    console.log("Milestone clicked:", milestone);
  };

  const handleProjectClick = (project: Project) => {
    alert(`Project Clicked: ${project.name}`);
    console.log("Project clicked:", project);
  };

  const handleTaskCreate = (task: Task) => {
    alert(`Task Created: ${task.title}`);
    console.log("Task created:", task);
    dispatch(TaskActions.add(task)); // Dispatch an action to add the task to the store
  };

  const handleTaskResize = (
    task: Task,
    newSize: number,
    startDate: Date,
    endDate: Date
  ) => {
    console.log(`Task Resized: ${task.title}`, newSize);
    // Dispatch the size update
    dispatch(
      resizeTask({
        task,
        newSize
      })
    );
    
    // Dispatch a separate action for date updates if needed
    dispatch(
      updateTaskDates({
        task,
        startDate,
        endDate
      })
    );
  };
  
  // Example of updateTaskDates action creator and reducer
  const updateTaskDates = (payload: { task: Task; startDate: Date; endDate: Date }) => ({
    type: 'UPDATE_TASK_DATES',
    payload
  });




const initialState: TaskState = {
  id: '', // Initialize with appropriate values
  tasks: [],
  loading: false,
  error: null,
  updateTaskTitle: (title) => {}, // Define your updateTaskTitle function
  deleteTask: (id) => {}, // Define your deleteTask function
  taskTitle: '',
  taskDescription: '',
  status: 'pending', // Example initialization for status
  dueDate: null,
  priority: PriorityTypeEnum.Low, // Example initialization for priority
  taskStatus: 'active', // Example initialization for taskStatus
  entitiesLoaded: {},
  tags: [],
  draggingTaskId: '',
};
  
  
const tasksReducer = (state: TaskState = initialState, action: { type: string; payload: any }): TaskState => {
  switch(action.type) {
    case 'UPDATE_TASK_DATES':
      const { task, startDate, endDate } = action.payload;
      const index = state.tasks.findIndex((t) => t.id === task.id);
      if (index !== -1) {
        // Create a new array to ensure immutability
        const updatedTasks = [
          ...state.tasks.slice(0, index), // Copy tasks before the updated one
          { ...task, startDate, endDate }, // Updated task
          ...state.tasks.slice(index + 1), // Copy tasks after the updated one
        ];
        return {
          ...state,
          tasks: updatedTasks,
        };
      }
      return state; // Return original state if task not found
    default:
      return state; // Return original state for unrecognized action types
  }
};
  
  const handleTaskDrop = (
    task: Task,
    newPosition: { startDate: Date; endDate: Date }
  ) => {
    console.log(`Task Dropped: ${task.title}`, newPosition);
    dispatch(
      dropTask({
        ...task,
        startDate: newPosition.startDate,
        endDate: newPosition.endDate,
      })
    );
  };

  const handleTaskChange = (task: Task, updatedProperties: Partial<Task>) => {
    console.log(`Task Changed: ${task.title}`, updatedProperties);
    dispatch(updateTask({ ...task, ...updatedProperties }));
  };

  const handleOnTaskCreate = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskDelete = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskTitleChange = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskStatusChange = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskProgressChange = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskDependencyChange = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskFilterChange = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskLabelChange = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskParentChange = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskExpandedChange = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskLinkAdd = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskLinkRemove = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskDependencyAdd = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskDependencyRemove = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskProgressAdd = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskProgressRemove = (task: Task) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskLabelAdd = (task: Task) => {
    throw new Error("Function not implemented.");
  };

  return (
    <div>
      <CalendarMonth
        onAudioCallStart={function (participantIds: string[]): void {
          throw new Error("Function not implemented.");
        }}
        onAudioCallEnd={function (participantIds: string[]): void {
          throw new Error("Function not implemented.");
        }}
        onVideoCallStart={function (participantIds: string[]): void {
          throw new Error("Function not implemented.");
        }}
        onVideoCallEnd={function (participantIds: string[]): void {
          throw new Error("Function not implemented.");
        }}
        projectId={projectId}
        month={month}
        year={year}
        milestones={milestones}
        selectedProject={selectedProject}
        tasks={tasks}
        events={events}
        {...taskHandlers}
      />
      <h2>Month View</h2>

      {selectedProjectData ? (
        <div>
          <h3>Project: {selectedProjectData.name}</h3>
          <h3>Description: {selectedProjectData.description}</h3>
          {/* Display other project details */}
        </div>
      ) : (
        // Render tasks for the month
        <div>
          {/* Map over tasks array and display each */}
          <TaskList tasks={tasks} />
          <h3>Tasks for {`${month}/${year}`}</h3>
          {/* Render tasks based on priority, date, etc. */}
        </div>
      )}

      {/* Display tasks, events, and milestones for the month */}
      <CalendarMonth
        projectId={projectId}
        year={year}
        month={month}
        events={events}
        selectedProject={selectedProject}
        tasks={[]}
        onTaskClick={handleTaskClick}
        onTaskDoubleClick={handleTaskDoubleClick}
        onTaskContextMenu={handleonTaskContextMenu}
        onTaskDragStart={handleTaskDragStart}
        onTaskDragEnd={handleTaskDragStart}
        onTaskResizingStart={onTaskResize}
        onTaskResizingEnd={onTaskResize}
        onTaskResize={onTaskResize}
        onTaskDrop={handleOnTaskDrop}
        onTaskChange={handleOnTaskChange}
        onTaskCreate={handleOnTaskCreate}
        onTaskDelete={handleOnTaskDelete}
        onTaskTitleChange={handleOnTaskTitleChange}
        onTaskStatusChange={handleOnTaskStatusChange}
        onTaskProgressChange={handleOnTaskProgressChange}
        onTaskDependencyChange={handleOnTaskDependencyChange}
        onTaskFilterChange={handleOnTaskFilterChange}
        onTaskLabelChange={handleOnTaskLabelChange}
        onTaskParentChange={handleOnTaskParentChange}
        onTaskExpandedChange={handleOnTaskExpandedChange}
        onTaskLinkAdd={handleOnTaskLinkAdd}
        onTaskLinkRemove={handleOnTaskLinkRemove}
        onTaskDependencyAdd={handleOnTaskDependencyAdd}
        onTaskDependencyRemove={handleOnTaskDependencyRemove}
        onTaskProgressAdd={handleOnTaskProgressAdd}
        onTaskProgressRemove={handleOnTaskProgressRemove}
        onTaskLabelAdd={handleOnTaskLabelAdd}
        milestones={milestones}
        onAudioCallStart={onAudioCallStart}
        onVideoCallStart={onVideoCallStart}
        onMessageSend={function (
          message: string,
          participantIds: string[]
        ): void {
          throw new Error("Function not implemented.");
        }}
        onMilestoneClick={handleMilestoneClick}
        cryptoHoldings={[]}
        onCryptoTransaction={function (transaction: CryptoTransaction): void {
          throw new Error("Function not implemented.");
        }}
        isDarkMode={false}
        onThemeToggle={function (): void {
          throw new Error("Function not implemented.");
        }}
        contentPosts={[]}
        onContentPostClick={function (post: ContentPost): void {
          throw new Error("Function not implemented.");
        }}
        onContentPostCreate={function (post: ContentPost): void {
          throw new Error("Function not implemented.");
        }}
        onContentPostDelete={function (post: ContentPost): void {
          throw new Error("Function not implemented.");
        }}
        onContentPostEdit={function (post: ContentPost): void {
          throw new Error("Function not implemented.");
        }}
        onContentPostSchedule={function (post: ContentPost): void {
          throw new Error("Function not implemented.");
        }}
        onContentPostPublish={function (post: ContentPost): void {
          throw new Error("Function not implemented.");
        }}
        onContentPostPerformanceTrack={function (post: ContentPost): void {
          throw new Error("Function not implemented.");
        }}
        projects={[]}
        onAudioCallEnd={function (participantIds: string[]): void {
          throw new Error("Function not implemented.");
        }}
        onVideoCallEnd={function (participantIds: string[]): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
};

export default MonthView;
