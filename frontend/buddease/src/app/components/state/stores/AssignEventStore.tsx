// AssignEventStore.tsx
import { makeObservable } from "mobx";
import  ExtendedCalendarEvent  from "../../calendar/CalendarEventTimingOptimization";
import { useNotification } from "../../support/NotificationContext";
import { User } from "../../users/User";
import { useAssignBaseStore } from "../AssignBaseStore";
import { PresentationEventAssignment } from "./UserPresentationsStore";
import CalendarEventTimingOptimization from "../../calendar/CalendarEventTimingOptimization";



interface ReassignData {
  eventId: string;       // Unique identifier for the event being reassigned
  oldUserId: string;     // User ID of the original assignee
  newUserId: string;     // User ID of the new assignee
}

interface ReassignEventResponse extends ExtendedCalendarEvent{
  eventId: string;       // Unique identifier for the event
  responseId: string;    // Unique identifier for the response
  userId: string;        // User ID of the responder
  comment: string;       // Comment or feedback provided by the responder
  timestamp: Date;       // Timestamp indicating when the response was submitted
  reassignData: ReassignData[]

}

export interface AssignEventStore {
  assignedUsers: Record<string, string[]>; // Use eventId as key and array of user IDs as value
  updateEventStatus: (eventId: string, status: string) => void;
  assignedEvents: Record<string, ExtendedCalendarEvent[]>; // Use eventId as key and array of event IDs as value
  assignedTodos: Record<string, string[]>; // Use eventId as key and array of todo IDs as value
  reassignUser: Record<string, ReassignEventResponse[]>;
  assignEvent: (eventId: string, userId: User) => void;
  assignUsersToEvents: (eventIds: string[], userId: string) => void;
  unassignUsersFromEvents: (eventIds: string[], userId: string) => void;
  setDynamicNotificationMessage: (message: string) => void;
  connectResponsesToTodos: (eventId: string) => void;
  reassignUsersToEvents: (
    eventIds: string[],
    oldUserId: CalendarEventTimingOptimization | ExtendedCalendarEvent, // Update parameter type
    newUserId: PresentationEventAssignment,
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
  // Success and Failure methods
  assignUserSuccess: () => void;
  assignUserFailure: (error: string) => void;

  // Add more methods or properties as needed
}

const useAssignEventStore = (): AssignEventStore => {
  const assignedUsers: Record<string, string[]> = {};
  const assignedEvents: Record<string, ExtendedCalendarEvent[]>= {};
  const assignedTodos: Record<string, string[]> = {};
  const reassignUser: Record<string, ReassignEventResponse[]> = {}

    const baseStore = useAssignBaseStore();

  const assignEvent = (eventId: string, assignedTo: User) => {
    // Add user to assigned events
    const event = baseStore.events[eventId] 
    if (event) {
      const updatedEvent = event.map((e) => {
        return {
          ...e,
          assignedTo: assignedTo,
        };
      });
      baseStore.events[eventId] = updatedEvent;
    } else {
      baseStore.events[eventId] = [
        {
          id: eventId,
          title: "",
          startTime: new Date(),
          endTime: new Date(),
          description: "",
          assignedTo: assignedTo,
          attendees: [],
          location: "",
          reminder: "",
          pinned: false,
          archived: false,
        },
      ];
    }
    useNotification();
    return assignUserSuccess();
  };
  

  const updateEventStatus = (eventId: string, status: string) => {
    const event = baseStore.events[eventId];
   }

  const assignUser = (eventId: string, userId: string) => {
    const users = assignedUsers[eventId];
    if (!users || !users.includes(userId)) {
      assignedUsers[eventId] = users ? [...users, userId] : [userId];
    }
    useNotification();
    return assignUserSuccess();
  };

  const unassignUser = (eventId: string, userId: string) => {
    const users = assignedUsers[eventId];
    if (users) {
      assignedUsers[eventId] = users.filter((id) => id !== userId);
    }
  };

  

  const assignUsersToEvents = (eventIds: string[], userId: string) => {
    eventIds.forEach((eventId) => assignUser(eventId, userId));
  };

  const unassignUsersFromEvents = (eventIds: string[], userId: string) => {
    eventIds.forEach((eventId) => unassignUser(eventId, userId));
  };

  const setDynamicNotificationMessage = (message: string) => {
    // Implement the logic for setting dynamic notification message
    useNotification().showMessageWithType(message); // Assuming useNotification() returns an object with a showMessage method
  };

  const reassignUsersToEvents = (
    eventIds: string[],
    oldUserId: CalendarEventTimingOptimization | ExtendedCalendarEvent,
    newUserId: PresentationEventAssignment,
  ) => {
    eventIds.forEach((eventId: string) => {
      const users = assignedEvents[eventId];
      if (users) {
        const oldUserIdIndex = users.indexOf(oldUserId);
        if (oldUserIdIndex !== -1) {
          // Check if newUserId is an ExtendedCalendarEvent
          if ("eventId" in newUserId && "suggestedStartTime" in newUserId) {
            // If newUserId has the required properties, it's compatible with ExtendedCalendarEvent
            if (oldUserId instanceof ExtendedCalendarEvent) {
              // Ensure oldUserId is ExtendedCalendarEvent
              users.splice(oldUserIdIndex, 1, newUserId);
            } else {
              // If oldUserId is not ExtendedCalendarEvent, we can't assign newUserId directly
              // Handle this case according to your application's logic
              console.error(
                "Cannot assign newUserId directly because oldUserId is not an ExtendedCalendarEvent"
              );
            }
          } else {
            // If newUserId is not ExtendedCalendarEvent, assume it's CalendarEventTimingOptimization
            if (oldUserId instanceof CalendarEventTimingOptimization) {
              // Ensure oldUserId is CalendarEventTimingOptimization
              users.splice(oldUserIdIndex, 1, newUserId);
            } else {
              // If oldUserId is not CalendarEventTimingOptimization, we can't assign newUserId directly
              // Handle this case according to your application's logic
              console.error(
                "Cannot assign newUserId directly because oldUserId is not a CalendarEventTimingOptimization"
              );
            }
          }
        }          
      }
    });
  };
  
  

  const assignUserToTodo = (todoId: string, userId: string) => {
    const users = assignedTodos[todoId];
    if (!users || !users.includes(userId)) {
      assignedTodos[todoId] = users ? [...users, userId] : [userId];
    }
  };

  const unassignUserFromTodo = (todoId: string, userId: string) => {
    const users = assignedTodos[todoId];
    if (users) {
      assignedTodos[todoId] = users.filter((id) => id !== userId);
    }
  };

  const reassignUserInTodo = (
    todoId: string,
    oldUserId: string,
    newUserId: string
  ) => {
    unassignUserFromTodo(todoId, oldUserId);
    assignUserToTodo(todoId, newUserId);
    useNotification();
  };

  const assignUsersToTodos = (todoIds: string[], userId: string) => {
    todoIds.forEach((todoId) => assignUserToTodo(todoId, userId));
  };

  const unassignUsersFromTodos = (todoIds: string[], userId: string) => {
    todoIds.forEach((todoId) => unassignUserFromTodo(todoId, userId));
  };

  const reassignUsersInTodos = (
    todoIds: string[],
    oldUserId: string,
    newUserId: string
  ) => {
    todoIds.forEach((todoId) =>
      reassignUserInTodo(todoId, oldUserId, newUserId)
    );
  };

  // Helper function to get responses based on eventId (replace with actual implementation)
  const getResponsesByEventId = (eventId: string) => {
    // Simulated method, replace with actual implementation
   const responses= [
     {
        eventId: "event1",
        responseId: "response1",
        userId: "user1",
        comment: "Great work!",
        timestamp: new Date(),
      } as ReassignEventResponse
      // Add more responses
    ];

  // Filter responses based on the eventId
  return responses.filter(response => response.eventId === eventId);
  };

  // Helper function to convert responses to todos
const convertResponsesToTodos = (responses: ReassignEventResponse[]): string[] => {
  // Map over the responses and extract the responseId property
  return responses.map((response) => response.responseId);
};

  const connectResponsesToTodos = (eventId: string) => {
    // Assuming there is a method to get responses based on eventId
    const responses: ReassignEventResponse[] = getResponsesByEventId(eventId);
  
    // Assuming there is a method to convert responses to todo IDs (strings)
    const todoIds: string[] = convertResponsesToTodos(responses);
  
    // Assuming there is a method to assign todo IDs to users or teams
    baseStore.assignTodosToUsersOrTeams(todoIds, ["assignees"]);
  };

  const assignUserSuccess = () => {
    useNotification();
  };

  const assignUserFailure = (error: string) => {
    useNotification();
  };

  
  const useAssignEventStore = makeObservable({
    assignedUsers,
    assignedEvents,
    assignedTodos,
    reassignUser,
    updateEventStatus,
    assignEvent,
    assignUsersToEvents,
    setDynamicNotificationMessage,
    reassignUsersToEvents,
    unassignUsersFromEvents,
    assignUserToTodo,
    unassignUserFromTodo,
    reassignUserInTodo,
    assignUsersToTodos,
    unassignUsersFromTodos,
    reassignUsersInTodos,
    assignUserSuccess,
    assignUserFailure,
    connectResponsesToTodos,
  })

  return useAssignEventStore
};

export { useAssignEventStore };
export type { ReassignEventResponse };

