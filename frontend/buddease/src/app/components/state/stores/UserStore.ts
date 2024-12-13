import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
//UserStore.ts
import { getTasksByUserId } from "@/app/api/TasksApi";
import { BaseCustomEvent } from "@/app/components/event/BaseCustomEvent";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import CalendarEventTimingOptimization, {
  ExtendedCalendarEvent,
} from "../../calendar/CalendarEventTimingOptimization";
import { Task, tasksDataSource } from "../../models/tasks/Task";
import { sanitizeData } from "../../security/SanitizationFunctions";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { Todo } from "../../todos/Todo";
import { User } from "../../users/User";
import { useSecureUserId } from "../../utils/useSecureUserId";
import { AssignBaseStore, useAssignBaseStore } from "../AssignBaseStore";
import {
  AssignEventStore,
  ReassignEventResponse,
  useAssignEventStore,
} from "./AssignEventStore";
import { useAssignTeamMemberStore } from "./AssignTeamMemberStore";
import { useUndoRedoStore } from "./UndoRedoStore";


type EventStoreSubset = Pick<
  ReturnType<typeof useAssignEventStore>,
  | "assignedUsers"
  | "updateEventStatus"
  | "assignedEvents"
  | "assignedTodos"
  | "assignEvent"
  | "assignUsersToEvents"
  | "unassignUsersFromEvents"
  | "setDynamicNotificationMessage"
  | "reassignUsersToEvents"
  | "assignUserToTodo"
  | "unassignUserFromTodo"
  | "reassignUserInTodo"
  | "assignUsersToTodos"
  | "unassignUsersFromTodos"
  | "reassignUsersInTodos"
  | "assignUserSuccess"
  | "assignUserFailure"
  | "convertResponsesToTodos"
  | "getResponsesByEventId"
>;

const eventSubset = { ...useAssignEventStore() } as EventStoreSubset;

// todo incorporate
// Define the necessary types and interfaces
type UserStoreSubset = Pick<AssignBaseStore, "snapshotStore" | "events">;

export interface UserStore
  extends AssignEventStore,
    AssignBaseStore,
    UserStoreSubset {
  // Define a custom interface that extends necessary properties from AssignEventStore and AssignBaseStore
  // Add additional properties specific to UserStore if needed
  users: Record<string, User[]>;
  currentUser: User | null;
  authStore: ReturnType<typeof useAuth>;
  // setAssignedTaskStore: (task: Task, user: User) => void;
  updateUserState: (newUsers: Record<string, User[]>) => void;
  assignTask: (task: Task, user: User) => void;
  assignFileToTeam: Record<string, string[]>; // Add this property
  assignContactToTeam: Record<string, string[]>; // Add this property
  assignEventToTeam: Record<string, string[]>; // Add this property
  assignGoalToTeam: Record<string, string[]>; // Add this property
  events: Record<
    string,
    CalendarEventTimingOptimization[] | ExtendedCalendarEvent[]
  >;
  // Other properties and methods...
  reassignUser: Record<string, ReassignEventResponse[]>;
  batchFetchUserSnapshotsSuccess: (userId: Record<string, User[]>) => void;
  batchFetchUserSnapshotsRequest: (userId: Record<string, User[]>) => void;
  batchFetchUndoRedoSnapshotsRequest: (userId: string) => void;
  fetchUsersByTaskId: (userId: string) => Promise<string>;
   setDynamicNotificationMessage: (message: Message, type: NotificationType) => void;
}

const userManagerStore = (): UserStore => {
  const { notify } = useNotification();
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>("");
  const [users, setUsers] = useState<Record<string, User[]>>({
    // Initialize with the required structure
  });

  // Accessing the currentUser from AuthContext
  const {
    state: { user: currentUser },
  } = useAuth();

  // Sanitize input before updating user state
  const updateUserState = (newUsers: Record<string, User[]>) => {
    // Sanitize the data before updating
    const sanitizedUsers = sanitizeData(JSON.stringify(newUsers)); // Sanitize the data and convert it back to JSON
    setUsers(JSON.parse(sanitizedUsers)); // Convert the sanitized data back to its original format and set the state
  };

  const assignTask = (task: Task, user: User) => {
    // Assign task to user
    eventSubset.assignEvent(task.eventId, user); // Changed user._id to user

    if (user.tasks && Array.isArray(user.tasks)) {
      // Update user's assigned tasks
      user.tasks.push(task);

      // Update task's assigned user(s)
      if (task.assignedTo === null) {
        // If no users are assigned yet, assign the user directly
        task.assignedTo = user;
      } else if (Array.isArray(task.assignedTo)) {
        // If already assigned to multiple users, add the user to the array
        task.assignedTo.push(user);
      } else {
        // If already assigned to a single user, convert it to an array of users
        task.assignedTo = [task.assignedTo, user];
      }
    }
  };

  // Function to fetch a task by its ID
  const getUserById = (taskId: string): Promise<Task | null> => {
    return new Promise<Task | null>(async (resolve, reject) => {
      try {
        setTimeout(() => {
          const task: Task | undefined = tasksDataSource[taskId];

          if (task) {
            resolve(task);
          } else {
            resolve(null);
          }
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  };

  const assignUser = {} as Record<string, string[]>;

  const reassignUser = {} as Record<string, ReassignEventResponse[]>;

  const unassignUser = {} as Record<string, string[]>;

  const reassignUsersForArray = (
    user: string,
    newUser: ExtendedCalendarEvent,
    eventOrTodo: BaseCustomEvent | Todo
  ) => {
    reassignUserForSingle(user, newUser, eventOrTodo);
  };

  // Define type guards for User and Task
  function isUser(data: any): data is User {
    return (
      data && typeof data === "object" && "id" in data && "username" in data
    );
  }

  function isTask(data: any): data is Task {
    return (
      data && typeof data === "object" && "taskId" in data && "taskName" in data
    );
  }

  // Define a generic function to fetch users by ID
  const fetchUsersByUserId = async <T>(userId: string): Promise<string> => {
    try {
      // Wrap the getUserById call in a promise
      const result: T | null = await new Promise<T | null>(
        (resolve, reject) => {
          getUserById(userId)
            .then((data: any) => resolve(data as T))
            .catch((error) => reject(error));
        }
      );

      // Check if the result was successfully fetched
      if (result) {
        // Check and handle as User type
        if (isUser(result)) {
          const user = result as User;
          const tasks: Task[] = await getTasksByUserId(Number(userId));

          // Update state or perform other operations specific to User
          setUsers((prevUsers) => ({
            ...prevUsers,
            [user.id]: {
              ...user,
              tasks: tasks,
            },
          }));

          // Notify user of successful user fetching
          setDynamicNotificationMessage(
            NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
          );

          return "User fetched successfully.";
        }

        // Add additional type checks if needed
        // For example:
        // if (isTask(result)) {
        //   const task = result as Task;
        //   // Handle Task-specific logic
        //   return "Task fetched successfully.";
        // }

        // Handle other types if needed
        return "Result fetched successfully."; // Adjust return message as needed
      } else {
        console.error(`Data for ID ${userId} not found.`);
        // Notify user that the data was not found
        setDynamicNotificationMessage(
          NOTIFICATION_MESSAGES.Error.DATA_NOT_FOUND
        );
        return "Data not found."; // Return error message
      }
    } catch (error) {
      console.error(`Error fetching data for ID ${userId}:`, error);
      // Notify user of error while fetching data
      setDynamicNotificationMessage(
        NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA
      );
      throw new Error("Error fetching data."); // Throw error
    }
  };

  const batchFetchUserSnapshotsSuccess =
    async (userId: Promise<string>) => async (dispatch: any) => {
      console.log(`Task ${userId} fetched`);
      notify(
        "batchFetchTaskSnapshotsFailure",
        `Task ${userId} fetched`,
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );

      // Assuming you have a method to fetch tasks by userId from your data source
      const users = fetchUsersByUserId(await userId); // Implement this method

      // Check if users is not null or undefined
      if (users) {
        // Dispatch the fetched users to the store or perform any necessary logic
        dispatch(batchFetchUserSnapshotsSuccess(users));

        // Simulating asynchronous operation
        setTimeout((error: Error) => {
          notify(
            "batchFetchTaskSnapshotsFailure",
            `Error fetching task ${userId}`,
            NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
            new Date(),
            NotificationTypeEnum.OperationSuccess
          );
        }, 1000);
      } else {
        console.error(`Tasks not found for userId ${userId}`);
      }
    };

  const setDynamicNotificationMessage = (message: string) => {
    setNotificationMessage(message);
  };

  const batchFetchUserSnapshotsRequest = (userId: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        let userId = useSecureUserId()?.toString();
        console.log(`Task ${userId} fetched`);
        (await batchFetchUserSnapshotsSuccess(Promise.resolve(userId!)))(
          resolve
        );
      }, 1000);
    });
  };
  const reassignUserForSingle = (
    user: string,
    newUser: CalendarEventTimingOptimization | ExtendedCalendarEvent,
    eventOrTodo: BaseCustomEvent | Todo
  ) => {
    let convertedNewUser: CalendarEventTimingOptimization;

    if ("eventId" in newUser) {
      // newUser is already of type CalendarEventTimingOptimization
      convertedNewUser = newUser as CalendarEventTimingOptimization;
    } else {
      // newUser is of type ExtendedCalendarEvent, convert it to CalendarEventTimingOptimization
      const extendedEvent = newUser as ExtendedCalendarEvent;
      convertedNewUser = {
        eventId: extendedEvent.id,
        suggestedStartTime: extendedEvent.startTime,
        suggestedEndTime: extendedEvent.endTime,
        suggestedDuration: extendedEvent.duration,
        suggestedDay: null,
        suggestedWeeks: null,
        suggestedMonths: null,
        suggestedSeasons: null,
        assignedTo: extendedEvent.assignedTo,
        // Map other properties as necessary
      };
    }

    reassignUsersToEvents([user], convertedNewUser, eventOrTodo);
  };
  const { reassignUsersToEvents } = eventSubset;
  const userStore = makeAutoObservable({
    // User-related properties and methods
    users,
    currentUser,

    authStore: useAssignEventStore().authStore,
    updateUserState,
    assignTask,
    assignUser,
    reassignUser: useAssignBaseStore().reassignUser,
    unassignUser,
    reassignUsersForArray,
    assignUserSuccess: useAssignBaseStore().assignUserSuccess,
    assignUserFailure: useAssignBaseStore().assignUserFailure,

    // Event-related properties and methods
    events: eventSubset.assignedEvents, // Adjusted to match the type,
    assignedUsers: useAssignEventStore().assignedUsers,
    assignedEvents: useAssignEventStore().assignedEvents,
    assignedTodos: useAssignEventStore().assignedTodos,
    assignEvent: useAssignEventStore().assignEvent,
    assignUsersToEvents: useAssignEventStore().assignUsersToEvents,
    unassignUsersFromEvents: useAssignEventStore().unassignUsersFromEvents,
    setDynamicNotificationMessage:
      useAssignEventStore().setDynamicNotificationMessage,
    reassignUsersToEvents: useAssignEventStore().reassignUsersToEvents,
    updateEventStatus: useAssignEventStore().updateEventStatus,
    connectResponsesToTodos: useAssignEventStore().connectResponsesToTodos,

    // Task-related properties and methods
    assignedTasks: useAssignTeamMemberStore().assignedTasks,
    assignedItems: useAssignTeamMemberStore().assignedItems,
    assignedTeams: useAssignTeamMemberStore().assignedTeams,
    assignItem: useAssignTeamMemberStore().assignItem,
    assignTodoToTeam: useAssignTeamMemberStore().assignTodoToTeam,
    assignTodosToUsersOrTeams:
      useAssignTeamMemberStore().assignTodosToUsersOrTeams,
    assignTeamMemberToTeam: useAssignTeamMemberStore().assignTeamMemberToTeam,
    unassignTeamMemberFromItem:
      useAssignTeamMemberStore().unassignTeamMemberFromItem,
    assignTaskToTeam: useAssignTeamMemberStore().assignTaskToTeam,
    assignTeam: useAssignTeamMemberStore().assignTeam,
    assignUsersToItems: useAssignTeamMemberStore().assignUsersToItems,
    unassignUsersFromItems: useAssignTeamMemberStore().unassignUsersFromItems,
    reassignUsersToItems: useAssignTeamMemberStore().reassignUsersToItems,
    snapshotStore: useAssignTeamMemberStore().snapshotStore,
    assignTeamToTodo: useAssignTeamMemberStore().assignTeamToTodo,
    unassignTeamToTodo: useAssignTeamMemberStore().unassignTeamToTodo,
    reassignTeamToTodo: useAssignTeamMemberStore().reassignTeamToTodo,

    // Team-related properties and methods
    assignTeamsToTodos: useAssignTeamMemberStore().assignTeamsToTodos,
    assignTeamToTodos: useAssignTeamMemberStore().assignTeamToTodos,
    unassignTeamFromTodos: useAssignTeamMemberStore().unassignTeamFromTodos,
    reassignTeamToTodos: useAssignTeamMemberStore().reassignTeamToTodos,
    reassignTeamsInTodos: useAssignTeamMemberStore().reassignTeamsInTodos,
    assignMeetingToTeam: useAssignTeamMemberStore().assignMeetingToTeam,
    assignProjectToTeam: useAssignTeamMemberStore().assignProjectToTeam,

    // todo-releated methods
    assignUserToTodo: useAssignEventStore().assignUserToTodo,
    unassignUserFromTodo: useAssignEventStore().unassignUserFromTodo,
    reassignUserInTodo: useAssignEventStore().reassignUserInTodo,
    assignUsersToTodos: useAssignEventStore().assignUsersToTodos,
    unassignUsersFromTodos: useAssignEventStore().unassignUsersFromTodos,
    reassignUsersInTodos: useAssignEventStore().reassignUsersInTodos,
    setAssignedTaskStore: useAssignTeamMemberStore().setAssignedTaskStore,
    // Other properties and methods
    assignNote: useAssignTeamMemberStore().assignNote,
    unassignNoteFromTeam: useAssignTeamMemberStore().unassignNoteFromTeam,
    unassignTeamsFromTodos: useAssignTeamMemberStore().unassignTeamsFromTodos,
    assignContactToTeam: useAssignBaseStore().assignContactToTeam,
    assignEventToTeam: useAssignBaseStore().assignEventToTeam,
    assignGoalToTeam: useAssignBaseStore().assignGoalToTeam,
    assignBookmarkToTeam: useAssignBaseStore().assignBookmarkToTeam,
    assignNoteToTeam: useAssignTeamMemberStore().assignNoteToTeam,
    assignFileToTeam: useAssignBaseStore().assignFileToTeam,
    assignCalendarEventToTeam: useAssignBaseStore().assignCalendarEventToTeam,
    assignBoardItemToTeam: useAssignBaseStore().assignBoardItemToTeam,
    assignBoardColumnToTeam: useAssignBaseStore().assignBoardColumnToTeam,
    assignBoardViewToTeam: useAssignBaseStore().assignBoardViewToTeam,
    assignBoardListToTeam: useAssignBaseStore().assignBoardListToTeam,
    assignBoardLabelToTeam: useAssignBaseStore().assignBoardLabelToTeam,
    assignBoardCommentToTeam: useAssignBaseStore().assignBoardCommentToTeam,
    assignBoardActivityToTeam: useAssignBaseStore().assignBoardActivityToTeam,
    assignBoardCardToTeam: useAssignBaseStore().assignBoardCardToTeam,
    assignBoardMemberToTeam: useAssignBaseStore().assignBoardMemberToTeam,
    assignBoardSettingToTeam: useAssignBaseStore().assignBoardSettingToTeam,
    assignBoardPermissionToTeam:
      useAssignBaseStore().assignBoardPermissionToTeam,
    assignBoardNotificationToTeam:
      useAssignBaseStore().assignBoardNotificationToTeam,
    assignBoardIntegrationToTeam:
      useAssignBaseStore().assignBoardIntegrationToTeam,
    assignBoardAutomationToTeam:
      useAssignBaseStore().assignBoardAutomationToTeam,
    assignBoardCustomFieldToTeam:
      useAssignBaseStore().assignBoardCustomFieldToTeam,
    
    
      getAuthStore: useAssignBaseStore().getAuthStore,
    
    
    batchFetchUserSnapshotsSuccess,
    batchFetchUserSnapshotsRequest,
    batchFetchUndoRedoSnapshotsRequest: useUndoRedoStore().batchFetchUndoRedoSnapshotsRequest,
    fetchUsersByTaskId,
   
    convertResponsesToTodos: useAssignEventStore().convertResponsesToTodos,
    getResponsesByEventId:  useAssignEventStore().getResponsesByEventId,
   
  });

  return userStore;
};

export { userManagerStore };
