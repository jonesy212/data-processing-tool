// UserStore.ts
import {
    NotificationTypeEnum,
    useNotification,
} from "@/app/context/NotificationContext";
//UserStore.ts
import CalendarEventTimingOptimization, {
    ExtendedCalendarEvent,
} from "@/app/calendar/CalendarEventTimingOptimization";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseCustomEvent } from "@/app/events/BaseCustomEvent";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { useSecureUserId } from "@/app/hooks/useSecureUserId";
import { sanitizeData } from "@/app/models/crypto/SanitizationFunctions";
import { Task } from "@/app/models/tasks/Task";
import { tasksDataSource } from "@/app/models/tasks/TaskDataSource";
import { useAuth } from "@/app/state/context/AuthContext";
import { AssignBaseStore, useAssignBaseStore } from "@/app/state/stores/AssignBaseStore";
import { Todo } from "@/app/todos/Todo";
import { User } from "@/app/users/User";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
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

export interface UserStore<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  extends AssignEventStore,
    AssignBaseStore,
    UserStoreSubset {
  // Define a custom interface that extends necessary properties from AssignEventStore and AssignBaseStore
  // Add additional properties specific to UserStore if needed
  users: Record<string, User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  currentUser: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  authStore: ReturnType<typeof useAuth>;
  // setAssignedTaskStore: (task: Task, user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  updateUserState: (newUsers: Record<string, User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>) => void;
  assignTask: (
    task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
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
  batchFetchUserSnapshotsSuccess: (userId: Record<string, User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>) => void;
  batchFetchUserSnapshotsRequest: (userId: Record<string, User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>) => void;
  batchFetchUndoRedoSnapshotsRequest: (userId: string) => void;
  fetchUsersByTaskId: (userId: string) => Promise<string>;
   setDynamicNotificationMessage: (message: Message, type: NotificationType) => void;
}

const userManagerStore = (): UserStore => {
  const { notify } = useNotification();
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>("");
  const [users, setUsers] = useState<Record<string, User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>>({
    // Initialize with the required structure
  });

  // Accessing the currentUser from AuthContext
  const {
    state: { user: currentUser },
  } = useAuth();

  // Sanitize input before updating user state
  const updateUserState = (newUsers: Record<string, User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>) => {
    // Sanitize the data before updating
    const sanitizedUsers = sanitizeData(JSON.stringify(newUsers)); // Sanitize the data and convert it back to JSON
    setUsers(JSON.parse(sanitizedUsers)); // Convert the sanitized data back to its original format and set the state
  };

  const assignTask = (
    task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
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
  const getUserById = (taskId: string): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
    return new Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(async (resolve, reject) => {
      try {
        setTimeout(() => {
          const task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined = tasksDataSource[taskId];

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
  function isUser(data: any): data is User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return (
      data && typeof data === "object" && "id" in data && "username" in data
    );
  }

  function isTask(data: any): data is Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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
          const user = result as User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          const tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = await getTasksByUserId(Number(userId));

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
        NotificationTypeEnum.OPERATION_SUCCESS
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
            NotificationTypeEnum.OPERATION_SUCCESS
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
        suggestedDay: extendedEvent.suggestedDay || null,        // Fallback to null
        suggestedWeeks: extendedEvent.suggestedWeeks || null,    // Fallback to null
        suggestedMonths: extendedEvent.suggestedMonths || null,  // Fallback to null
        suggestedSeasons: extendedEvent.suggestedSeasons || null, // Fallback to null
        assignedTo: extendedEvent.assignedTo,
        events: extendedEvent.events,
        optimizeTiming: extendedEvent.optimizeTiming
        // Map other properties as necessary
      };
    }

    reassignUsersToEvents([user], convertedNewUser, eventOrTodo);
  };
  const { reassignUsersToEvents } = eventSubset;

  const userStore = makeAutoObservable({
    // User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>-related properties and methods
    users,
    currentUser,

    authStore: useAuth(),
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
