// UserPresentationsStore.ts

import { WritableDraft } from "../redux/ReducerGenerator";
import { BaseCustomEvent } from "@/app/components/event/BaseCustomEvent";
import { Todo } from "../../todos/Todo";
import { AssignEventStore, useAssignEventStore } from "./AssignEventStore";
import { useAssignTeamMemberStore } from "./AssignTeamMemberStore";
import { ExtendedCalendarEvent } from "../../calendar/CalendarEventTimingOptimization";


export type PresentationEventAssignment = BaseCustomEvent | Todo | ExtendedCalendarEvent


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
>;

const eventSubset = { ...useAssignEventStore() } as EventStoreSubset;

export interface UserPresentation {
  reassignUsersForArray: (
    user: string,
    newUsers: ExtendedCalendarEvent[],
    eventOrTodo: BaseCustomEvent | Todo
  ) => void;
  reassignUserForSingle: (
    user: string,
    newUser: ExtendedCalendarEvent,
    eventOrTodo: BaseCustomEvent | Todo
  ) => void;
  reassignUsersToEvents: (
    eventIds: string[],
    oldUserId: ExtendedCalendarEvent,
    newUserId: BaseCustomEvent | Todo, // Update the type of newUserId
  ) => void;
  
  assignEvent: (eventId: string, userId: string) => void;
  assignedUsers: Record<string, string[]>;
  assignedEvents: Record<string, ExtendedCalendarEvent[]>;
  assignedTodos: Record<string, string[]>;
  assignUsersToEvents: (
    users: string[],
    eventId: string,
    eventOrTodoId: string
  ) => void;
  unassignUsersFromEvents: (
    users: string[],
    eventId: string,
    eventOrTodoId: string
  ) => void;
  setDynamicNotificationMessage: (
    type: string,
    notification: string
  ) => void;
  reassignUsersInTodos: (
    todoIds: string[],
    oldUserId: string,
    newUserId: string
  ) => void;
  assignUserToTodo: (userId: string, todoId: string) => void;
  unassignUserFromTodo: (userId: string, todoId: string) => void;
  reassignUserInTodo: (
    oldUser: string,
    newUser: string,
    todoId: string
  ) => void;
  assignUsersToTodos: (userIds: string[], todoId: string) => void;
  unassignUsersFromTodos: (userIds: string[], todoId: string) => void;
  assignUserSuccess: (message: string) => void;
  assignUserFailure: (error: string) => void;
}

export const useUserPresentation = (): UserPresentation => {
  const {
    reassignUsersToEvents,
    assignEvent,
    assignedUsers,
    assignedEvents,
    assignedTodos,
    assignUsersToEvents,
    unassignUsersFromEvents,
    setDynamicNotificationMessage,
    reassignUsersInTodos,
    assignUserToTodo,
    unassignUserFromTodo,
    reassignUserInTodo,
    assignUsersToTodos,
    unassignUsersFromTodos,
    assignUserSuccess,
    assignUserFailure,
  } = eventSubset;
    
  const reassignUsersForArray = (
    user: string,
    newUsers: ExtendedCalendarEvent[],  // Change parameter name to newUsers
    eventOrTodo: BaseCustomEvent | Todo
  ) => {
    newUsers.forEach((newUser: ExtendedCalendarEvent) => {
      reassignUsersToEvents([user], newUser, eventOrTodo);  // Pass newUser directly
    });
  };
  
  const reassignUserForSingle = (
    user: string,
    newUser: ExtendedCalendarEvent,  // Change parameter name to newUsers
    eventOrTodo: PresentationEventAssignment
  ) => {
    reassignUsersToEvents([user], newUser, eventOrTodo);  // Pass newUsers[0] for single user
  };
  

  return {
    reassignUsersForArray,
    reassignUserForSingle,
    reassignUsersToEvents,
    assignEvent,
    assignedUsers,
    assignedEvents,
    assignedTodos,
    assignUsersToEvents,
    unassignUsersFromEvents,
    setDynamicNotificationMessage,
    reassignUsersInTodos,
    assignUserToTodo,
    unassignUserFromTodo,
    reassignUserInTodo,
    assignUsersToTodos,
    unassignUsersFromTodos,
    assignUserSuccess,
    assignUserFailure,
  };
};
