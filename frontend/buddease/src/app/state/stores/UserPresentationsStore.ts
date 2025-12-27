// UserPresentationsStore.ts

import CalendarEventTimingOptimization, {
  ExtendedCalendarEvent,
} from "@/app/calendar/CalendarEventTimingOptimization";
import { BaseCustomEvent } from "@/app/events/BaseCustomEvent";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { Todo } from "@/app/todos/Todo";
import { User } from "@/app/users/User";
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes'
import { useAssignEventStore } from "@/app/state/stores/AssignEventStore";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

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

export interface UserPresentation<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  reassignUsersForArray: (
    user: string,
    newUsers: ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    oldUserId: CalendarEventTimingOptimization | ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    newUserId: PresentationEventAssignment,
    eventOrTodo: BaseCustomEvent | Todo
  ) => void;

  reassignUserForSingle: (
    user: string,
    newUser: ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    eventOrTodo: BaseCustomEvent | Todo
  ) => void;

  reassignUsersToEvents: (
    eventIds: string[],
    oldUserId: CalendarEventTimingOptimization,
    newUserId: PresentationEventAssignment
  ) => void;
  assignEvent: (eventId: string, userId: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  assignedUsers: Record<string, string[]>;
  assignedEvents: Record<
    string,
    (ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | CalendarEventTimingOptimization)[]
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
    message: Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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

const transformExtendedCalendarEventToOptimization = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  extendedEvent: ExtendedCalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): CalendarEventTimingOptimization<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  
  // Helper function to safely convert to Date
  const toDate = (value: string | Date | undefined): Date | undefined => {
    if (!value) return undefined;
    return typeof value === 'string' ? new Date(value) : value;
  };

  // Get assignedTo user ID
  const assignedToId = extendedEvent.assignedTo 
    ? (extendedEvent.assignedTo.id || extendedEvent.assignedTo._id || '') 
    : '';

  return {
    id: extendedEvent.id,
    startTime: toDate(extendedEvent.startTime),
    endTime: toDate(extendedEvent.endTime),
    duration: extendedEvent.duration,
    timestamp: extendedEvent.timestamp,
    
    eventId: extendedEvent.eventId || extendedEvent.id,
    assignedTo: assignedToId,
    
    // Use the properties from ExtendedCalendarEvent
    suggestedStartTime: extendedEvent.suggestedStartTime,
    suggestedEndTime: extendedEvent.suggestedEndTime,
    suggestedDuration: extendedEvent.suggestedDuration,
    suggestedDay: extendedEvent.suggestedDay,
    suggestedWeeks: extendedEvent.suggestedWeeks,
    suggestedMonths: extendedEvent.suggestedMonths,
    suggestedSeasons: extendedEvent.suggestedSeasons,

    // Add defaults for optional properties
    status: undefined,
    assignees: {},
    comments: {},
    notifications: {},
    reassignmentHistory: {},
    todoIds: [],
    relatedEventsList: []
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
