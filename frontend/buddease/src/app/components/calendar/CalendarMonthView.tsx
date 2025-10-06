// MonthView.jsx
import { TaskActions } from "@/app/actions/TaskActions";
import { CommonCalendarProps } from "@/app/calendar/Calendar";
import TaskList from "@/app/components/lists/TaskList";
import CryptoTransaction from "@/app/crypto/CryptoTransaction";
import { ContentPost } from "@/app/models/content/ContentPost";
import { NotificationPosition } from "@/app/models/data/StatusType";
import { Task } from "@/app/models/tasks/Task";
import { Project } from "@/app/projects/Project";
import { updateTask } from "@/app/state/redux/slices/CollaborationSlice";
import { RootState } from "@/app/state/redux/slices/RootSlice";
import {
  dropTask,
  resizeTask,
  updateTaskPositionAsync,
} from "@/app/state/redux/slices/TaskSlice";
import { rootStores } from "@/app/state/stores/RootStores";
import { NotificationTypeEnum, useNotification } from '@/context/NotificationContext';
import { Action, Dispatch, ThunkAction } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch } from "react-redux";
import CalendarMonth from "./CalendarMonth";
// import CalendarMonth from '@/CalendarMonthView';
 import * as taskApi from "@/app/api/TasksApi";
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { TaskState } from "@/app/state/redux/slices/TaskSlice";
import { YearInfo } from "./CalendarYear";
import { MonthInfo } from "./Month";

import { TaskCollection } from "@/app/snapshots/SnapshotActions";
import { updateTaskDetails } from "@/app/state/redux/slices/ContentSlice";
const {notify} = useNotification;

interface MonthViewProps extends CommonCalendarProps {
  selectedProject: (state: RootState, projectId: string) => Project | null;
  month: MonthInfo[]; // Add month prop
  year: YearInfo[]; // Add year prop

  tasks: TaskCollection; 
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
  const state: RootState = rootStores.calendarManager.getState(); // Get the root state
  const dispatch = useDispatch();
  const selectedProjectData = selectedProject
    ? selectedProject(state, projectId)
    : null; // Call the function to get the Project object if selectedProject is not null

  const handleTaskClick = (task: TaskEntity) => {
    // Handle task click
    alert(`Task Clicked: ${task.title}`);
    console.log("Task clicked:", task);
  };

  const handleTaskDoubleClick = (task: TaskEntity) => {
    // Handle task double click
    alert(`Task Double Clicked: ${task.title}`);
    console.log("Task double-clicked:", task);
  };

  const handleonTaskContextMenu = (task: TaskEntity, event: React.MouseEvent) => {
    // Handle task context menu
    event.preventDefault(); // Prevent the default context menu
    alert(`Task Context Menu: ${task.title}`);
    console.log("Task context menu:", task);
  };

  const handleTaskContextMenu = (task: TaskEntity, event: React.MouseEvent) => {
    // Handle task context menu
    event.preventDefault(); // Prevent the default context menu
    alert(`Task Context Menu: ${task.title}`);
    console.log("Task context menu:", task);
  };

  const handleTaskDragStart = (task: TaskEntity) => {
    // Handle task drag start
    console.log(task);
  };

// Define the Thunk action
const updateTaskPosition = (
  taskId: string,
  newPosition: number
): ThunkAction<void, RootState, unknown, Action<string>> => {
  return async (dispatch: Dispatch<Action<string>>, getState: () => RootState) => {
    try {
      // Make an API call to update the task's position in the database
      await taskApi.updateTaskPosition(
        taskId,
        newPosition,
        dispatch,
        () => {
          // Call notify with the required arguments
          notify(
            `task-position-updated-${taskId}`, // Unique ID for the notification
            "Task position updated", // Notification message
            { taskId, newPosition }, // Notification content
            new Date(), // Date of the notification
            NotificationType.OperationSuccess, // Notification type
            NotificationPosition.BottomRight // Optional: Notification position
          ).catch((error) => {
            console.error("Failed to send notification:", error);
          });
        }
      );

      // Dispatch an action to update the task's position in the Redux state
      dispatch(updateTaskPositionSuccess(taskId, newPosition));
    } catch (error) {
      // Handle error, if any
      console.error('Error updating task position:', error);

      // Notify about the error
      notify(
        `task-position-update-failed-${taskId}`, // Unique ID for the notification
        "Failed to update task position", // Notification message
        { taskId, error }, // Notification content
        new Date(), // Date of the notification
        NotificationType.OperationError, // Notification type
        NotificationPosition.BottomRight // Optional: Notification position
      ).catch((error) => {
        console.error("Failed to send error notification:", error);
      });
    }
  }
}


  const updateTaskPositionSuccess = (taskId: string, newPosition: number) => ({
    type: NotificationTypeEnum.TaskLogged, 
    payload: { taskId, newPosition },
  });

  const onTaskResize = (task: TaskEntity, newSize: number) => {
    // Handle task resize
    console.log(task, newSize);
    dispatch(resizeTask({ task, newSize }));
  };

  // handleOnTaskChange function logic
  const handleOnTaskChange = (task: TaskEntity, updatedDetails: Task) => {
    // Implement logic for handling task change
    console.log("Task changed:", task);
    console.log("Updated details:", updatedDetails);
    // Add your custom logic here
    // For example, you might want to update the task's details in the database
    // Or trigger a Redux action to update the task's details in the state

    // Example of updating task details in Redux state
    dispatch(updateTaskDetails({ id: task.id, updates: updatedDetails }));
  };



  const handleOnTaskDrop = (task: TaskEntity, newPosition: { [key: string]: number }) => {
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

  const handleTaskCreate = (task: TaskEntity) => {
    alert(`Task Created: ${task.title}`);
    console.log("Task created:", task);
    dispatch(TaskActions.add(task)); // Dispatch an action to add the task to the store
  };

  const handleTaskResize = (
    task: TaskEntity,
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
  const updateTaskDates = (payload: { task: TaskEntity; startDate: Date; endDate: Date }) => ({
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
    task: TaskEntity,
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

  const handleTaskChange = (task: TaskEntity, updatedProperties: Partial<Task>) => {
    console.log(`Task Changed: ${task.title}`, updatedProperties);
    dispatch(updateTask({ ...task, ...updatedProperties }));
  };

  const handleOnTaskCreate = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskDelete = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskTitleChange = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskStatusChange = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskProgressChange = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskDependencyChange = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskFilterChange = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskLabelChange = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskParentChange = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskExpandedChange = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskLinkAdd = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskLinkRemove = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskDependencyAdd = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskDependencyRemove = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskProgressAdd = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskProgressRemove = (task: TaskEntity) => {
    throw new Error("Function not implemented.");
  };
  const handleOnTaskLabelAdd = (task: TaskEntity) => {
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
