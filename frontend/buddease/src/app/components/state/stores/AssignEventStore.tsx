// Import necessary types and interfaces
import { fetchEventData } from "@/app/api/ApiEvent";
import appTreeApiService from "@/app/api/appTreeApi";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { isDataRecentEnough } from "@/app/utils/isDataRecentEnough";
import { makeObservable } from "mobx";
import {
  default as CalendarEventTimingOptimization,
  default as ExtendedCalendarEvent,
} from "../../calendar/CalendarEventTimingOptimization";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "../../support/NotificationContext";
import { User } from "../../users/User";
import { ExtendedTodo, useAssignBaseStore } from "../AssignBaseStore";
import { AuthStore } from "./AuthStore";
import { PresentationEventAssignment } from "./UserPresentationsStore";
import { EventData } from "@/app/utils/ethereumUtils";
import { fetchUsersByTaskApi } from "@/app/api/TasksApi";

const RESPONSES_STORAGE_KEY = "responses";

interface ReassignData {
  eventId: string;
  oldUserId: string;
  newUserId: string;
}

interface ReassignEventResponse extends ExtendedCalendarEvent, EventData {
  eventId: string; // Unique identifier for the event
  assignee: string; // User ID of the assignee
  todoId: string; // Unique identifier for the todo
  assigneeId: string; // User ID of the assignee
  oldUserId?: string; // User ID of the original assignee (optional)
  newUserId?: string; // User ID of the new assignee (optional)
  responseId: string; // Unique identifier for the response
  userId: string; // User ID of the responder
  comment: string; // Comment or feedback provided by the responder
  timestamp: Date | undefined; // Timestamp indicating when the response was submitted
  reassignData: ReassignData[]; // Additional reassignment data
}

interface AssignEventStore {
  assignedUsers: Record<string, string[]>; // Use eventId as key and array of user IDs as value
  updateEventStatus: (eventId: string, status: string) => void;
  assignedEvents: Record<string, ExtendedCalendarEvent[]>; // Use eventId as key and array of event IDs as value
  assignedTodos: Record<string, string[]>; // Use eventId as key and array of todo IDs as value
  reassignUser: Record<string, ReassignEventResponse[]>;
  assignEvent: (eventId: string, userId: User) => void;
  assignUsersToEvents: (eventIds: string[], userId: string) => void;
  unassignUsersFromEvents: (eventIds: string[], userId: string) => void;
  setDynamicNotificationMessage: (
    message: Message,
    type: NotificationType
  ) => void;
  getAuthStore: () => AuthStore;
  connectResponsesToTodos: (
    todoIds: string[],
    assignees: string[],
    todos: ExtendedTodo[],
    eventId: string,
    responses: ReassignEventResponse[]
  ) => void;

  reassignUsersToEvents: (
    eventIds: string[],
    oldUserId: ExtendedCalendarEvent | CalendarEventTimingOptimization,
    newUserId: PresentationEventAssignment
  ) => void;

  assignUserToTodo: (todoId: string, userId: string) => void;
  unassignUserFromTodo: (todoId: string, userId: string) => void;
  reassignUserInTodo: (
    todoId: string,
    oldUserId: string,
    newUserId: string
  ) => void;
  assignUsersToTodos: (todoIds: string[], userId: string) => void;
  unassignUsersFromTodos: (todoIds: string[], userId: string) => void;
  reassignUsersInTodos: (
    todoIds: string[],
    oldUserId: string,
    newUserId: string
  ) => void;

  assignUserSuccess: (message: string) => void;
  assignUserFailure: (error: string) => void;

  convertResponsesToTodos: (responses: ReassignEventResponse[]) => string[];
  getResponsesByEventId: (eventId: string) => Promise<ReassignEventResponse[]>;
  fetchUsersByTaskId: (taskId: string) => Promise<string[]>; // Fetches user IDs by task ID
}



const useAssignEventStore = (): AssignEventStore => {
  const assignedUsers: Record<string, string[]> = {};
  const assignedEvents: Record<string, ExtendedCalendarEvent[]> = {};
  const assignedTodos: Record<string, string[]> = {};
  const reassignUser: Record<string, ReassignEventResponse[]> = {};

  const baseStore = useAssignBaseStore();

  const updateEventStatus = (eventId: string, status: string) => {
    const event = baseStore.events[eventId];
    if (event && Array.isArray(event)) {
      event.forEach((e) => {
        if (e.status !== undefined) {
          e.status = status;
        }
      });
    } else {
      console.error(`Event with ID ${eventId} not found.`);
    }
  };




  const assignEvent = (eventId: string, userId: User) => {
    const event = baseStore.events[eventId];
    if (event && Array.isArray(event)) {
      event.forEach((e) => {
        if (e.assignedTo !== undefined) {
          e.assignedTo = userId;
        }
      });
    } else {
      console.error(`Event with ID ${eventId} not found.`);
    }
    useNotification();
    assignUserSuccess();
  };

  const assignUsersToEvents = (eventIds: string[], userId: string) => {
    eventIds.forEach((eventId) => {
      const event = baseStore.events[eventId];
      if (event && Array.isArray(event)) {
        event.forEach((e) => {
          if (e.assignedTo !== undefined) {
            e.assignedTo = userId;
          }
        });
      } else {
        console.error(`Event with ID ${eventId} not found.`);
      }
    });
    useNotification();
    assignUserSuccess();
  };

  const unassignUsersFromEvents = (eventIds: string[], userId: string) => {
    eventIds.forEach((eventId) => {
      const event = baseStore.events[eventId];
      if (event && Array.isArray(event)) {
        event.forEach((e) => {
          if (e.assignedTo === userId) {
            delete e.assignedTo;
          }
        });
      } else {
        console.error(
          `Event with ID ${eventId} not found or user not assigned.`
        );
      }
    });
    useNotification();
  };

  const setDynamicNotificationMessage = (
    message: Message,
    type: NotificationType
  ) => {
    useNotification().showMessageWithType(message, type);
  };

  const connectResponsesToTodos = (
    todoIds: string[],
    assignees: string[],
    todos: ExtendedTodo[],
    eventId: string,
    responses?: ReassignEventResponse[]
  ) => {
    baseStore.connectResponsesToTodos(
      todoIds,
      assignees,
      todos,
      eventId,
      responses!
    );
  };

  // Updated getResponsesByEventId function
  const getResponsesByEventId = async (
    eventId: string
  ): Promise<ReassignEventResponse[]> => {
    try {
      // Attempt to fetch from local storage first
      const cachedData: ReassignEventResponse[] =
        await appTreeApiService.fetchEventResponsesFromLocalStorage(eventId);

      // Check if data is recent enough
      const threshold = 0; // Define your threshold logic here
      if (cachedData && isDataRecentEnough(cachedData, threshold)) {
        return cachedData;
      }

      // Notify user about data refresh
      appTreeApiService.notify(
        "Event Responses Refresh",
        `Fetching event responses for event ${eventId} from API`,
        {},
        new Date(),
        NotificationTypeEnum.Info
      );

      // Fetch from API if not found or not recent enough
      const apiData: ReassignEventResponse[] = await fetchEventData(eventId);

      // Save the fetched data to local storage
      await appTreeApiService.saveEventResponsesToLocalStorage(
        eventId,
        apiData
      );

      return apiData;
    } catch (error) {
      console.error(`Error fetching responses for event ${eventId}:`, error);
      throw error;
    }
  };

  const convertResponsesToTodos = (
    responses: ReassignEventResponse[]
  ): string[] => {
    const todoIds = responses.map((response) => response.todoId);
    return Array.from(new Set(todoIds)); // Ensure unique todoIds
  };

  const assignUserSuccess = () => {
    console.log("User assigned successfully.");
  };

  const reassignUsersToEvents = (
    eventIds: string[],
    oldUserId: ExtendedCalendarEvent | CalendarEventTimingOptimization,
    newUserId: PresentationEventAssignment
  ) => {
    eventIds.forEach((eventId) => {
      const events = baseStore.events[eventId];
      if (events && Array.isArray(events)) {
        const index = events.findIndex(
          (event) => event.id === (oldUserId as ExtendedCalendarEvent).eventId
        );
        if (index !== -1) {
          const updatedEvent: ExtendedCalendarEvent = {
            ...events[index],
            assignedTo: newUserId as unknown as string,
          };
          events[index] = updatedEvent;
        } else {
          console.error(
            `Event with ID ${eventId} and old user ID ${
              (oldUserId as ExtendedCalendarEvent).eventId
            } not found.`
          );
        }
      } else {
        console.error(`Event with ID ${eventId} not found.`);
      }
    });
    useNotification();
    assignUserSuccess();
  };

  const assignUserToTodo = (todoId: string, userId: string) => {
    const todos = assignedTodos[todoId];
    if (!todos || !todos.includes(userId)) {
      assignedTodos[todoId] = todos ? [...todos, userId] : [userId];
    }
    useNotification();
    assignUserSuccess();
  };

  const unassignUserFromTodo = (todoId: string, userId: string) => {
    const todos = assignedTodos[todoId];
    if (todos) {
      assignedTodos[todoId] = todos.filter((id) => id !== userId);
    }
    useNotification();
  };

  const reassignUserInTodo = (
    todoId: string,
    oldUserId: string,
    newUserId: string
  ) => {
    unassignUserFromTodo(todoId, oldUserId);
    assignUserToTodo(todoId, newUserId);
    useNotification();
    assignUserSuccess();
  };

  const assignUsersToTodos = (todoIds: string[], userId: string) => {
    todoIds.forEach((todoId) => assignUserToTodo(todoId, userId));
    useNotification();
    assignUserSuccess();
  };

  const unassignUsersFromTodos = (todoIds: string[], userId: string) => {
    todoIds.forEach((todoId) => unassignUserFromTodo(todoId, userId));
    useNotification();
  };

  const reassignUsersInTodos = (
    todoIds: string[],
    oldUserId: string,
    newUserId: string
  ) => {
    todoIds.forEach((todoId) =>
      reassignUserInTodo(todoId, oldUserId, newUserId)
    );
    useNotification();
    assignUserSuccess();
  };

  const assignUserFailure = (error: string) => {
    console.error("User assignment failed:", error);
  };
  
  const fetchUsersByTaskId = async (taskId: string): Promise<string[]> => {
    try {
      const users = await fetchUsersByTaskApi(taskId);
      console.log(`Fetched users for task ID ${taskId}:`, users);
      return users;
    } catch (error) {
      console.error(`Failed to fetch users for task ID ${taskId}:`, error);
      return []; // Return an empty array on failure
    }
  };
  const useAssignEventStore = makeObservable({
    assignedUsers,
    assignedEvents,
    assignedTodos,
    reassignUser,
    fetchUsersByTaskId,
    updateEventStatus,
    assignEvent,
    assignUsersToEvents,
    unassignUsersFromEvents,
    setDynamicNotificationMessage,
    connectResponsesToTodos,
    reassignUsersToEvents,
    assignUserToTodo: baseStore.assignUserToTodo,
    unassignUserFromTodo,
    reassignUserInTodo,
    assignUsersToTodos,
    unassignUsersFromTodos,
    reassignUsersInTodos: baseStore.reassignUsersInTodos,
    assignUserSuccess,
    assignUserFailure,
    convertResponsesToTodos,
    getResponsesByEventId,
    getAuthStore: baseStore.getAuthStore,
  });

  return useAssignEventStore;
};

export { useAssignEventStore };
export type {
  AssignEventStore,
  EventData,
  ExtendedTodo,
  ReassignEventResponse,
};
