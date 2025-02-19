// UserPresentationsStore.ts

import { BaseCustomEvent } from "@/app/components/event/BaseCustomEvent";
import CalendarEventTimingOptimization, {
  ExtendedCalendarEvent,
} from "../../calendar/CalendarEventTimingOptimization";
import { Todo } from "../../todos/Todo";
import { User } from "../../users/User";
import { useAssignEventStore } from "./AssignEventStore";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { NotificationType } from "../../support/NotificationContext";

export type PresentationEventAssignment =
  | BaseCustomEvent
  | Todo
  | ExtendedCalendarEvent;

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
    oldUserId: CalendarEventTimingOptimization | ExtendedCalendarEvent,
    newUserId: PresentationEventAssignment,
    eventOrTodo: BaseCustomEvent | Todo
  ) => void;

  reassignUserForSingle: (
    user: string,
    newUser: ExtendedCalendarEvent,
    eventOrTodo: BaseCustomEvent | Todo
  ) => void;

  reassignUsersToEvents: (
    eventIds: string[],
    oldUserId: CalendarEventTimingOptimization,
    newUserId: PresentationEventAssignment
  ) => void;
  assignEvent: (eventId: string, userId: User) => void;
  assignedUsers: Record<string, string[]>;
  assignedEvents: Record<
    string,
    (ExtendedCalendarEvent | CalendarEventTimingOptimization)[]
  >;
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
    message: Message,
    type: NotificationType
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

const transformExtendedCalendarEventToOptimization = (
  extendedEvent: ExtendedCalendarEvent
): CalendarEventTimingOptimization => {
  return {
    eventId: extendedEvent.eventId,
    assignedTo: extendedEvent.assignedTo,
    suggestedStartTime: extendedEvent.suggestedStartTime,
    suggestedEndTime: extendedEvent.suggestedEndTime,
    suggestedDuration: extendedEvent.suggestedDuration,
    suggestedDay: extendedEvent.suggestedDay,
    suggestedWeeks: extendedEvent.suggestedWeeks,
    suggestedMonths: extendedEvent.suggestedMonths,
    suggestedSeasons: extendedEvent.suggestedSeasons,
  };
};

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
    newUsers: ExtendedCalendarEvent[],
    oldUserId: CalendarEventTimingOptimization | ExtendedCalendarEvent,
    newUserId: PresentationEventAssignment,
    eventOrTodo: BaseCustomEvent | Todo
  ) => {
    newUsers.forEach((newUser: ExtendedCalendarEvent) => {
      reassignUsersToEvents(
        [user],
        transformExtendedCalendarEventToOptimization(newUser),
        eventOrTodo
      );
    });
  };

  const reassignUserForSingle = (
    user: string,
    newUser: ExtendedCalendarEvent,
    eventOrTodo: PresentationEventAssignment
  ) => {
    reassignUsersToEvents(
      [user],
      transformExtendedCalendarEventToOptimization(newUser),
      eventOrTodo
    );
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
