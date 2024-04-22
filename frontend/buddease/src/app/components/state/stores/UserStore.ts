import { BaseCustomEvent } from "@/app/components/event/BaseCustomEvent";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { ExtendedCalendarEvent } from "../../calendar/CalendarEventTimingOptimization";
import { Task } from "../../models/tasks/Task";
import { sanitizeData } from "../../security/SanitizationFunctions";
import { Todo } from "../../todos/Todo";
import { User } from "../../users/User";
import { AssignBaseStore, useAssignBaseStore } from "../AssignBaseStore";
import { WritableDraft } from "../redux/ReducerGenerator";
import { AssignEventStore, ReassignEventResponse, useAssignEventStore } from "./AssignEventStore";
import { useAssignTeamMemberStore } from "./AssignTeamMemberStore";

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


// todo incorporate
// Define the necessary types and interfaces
type UserStoreSubset = Pick<
  AssignBaseStore,
  | "snapshotStore"
  | "events"
>;



// Define a custom interface that extends necessary properties from AssignEventStore and AssignBaseStore
export interface UserStore extends AssignEventStore, AssignBaseStore {
  // Add additional properties specific to UserStore if needed
  users: WritableDraft<Record<string, User[]>>;
  currentUser: User | null;
  updateUserState: (newUsers: Record<string, User[]>) => void;
  assignTask: (task: Task, user: User) => void;
    assignFileToTeam: Record<string, string[]>; // Add this property
  assignContactToTeam: Record<string, string[]>; // Add this property
  assignEventToTeam: Record<string, string[]>; // Add this property
  assignGoalToTeam: Record<string, string[]>; // Add this property
  events:Record<string, ExtendedCalendarEvent[]>
}

const userManagerStore = (): UserStore => {
  const [users, setUsers] = useState<WritableDraft<Record<string, User[]>>>({
    // Initialize with the required structure
  });

  // Accessing the currentUser from AuthContext
  const {
    state: { user: currentUser },
  } = useAuth();

  // Sanitize input before updating user state
  const updateUserState = (newUsers: WritableDraft<Record<string, User[]>>) => {
    // Sanitize the data before updating
    const sanitizedUsers = sanitizeData(JSON.stringify(newUsers)); // Sanitize the data and convert it back to JSON
    setUsers(JSON.parse(sanitizedUsers)); // Convert the sanitized data back to its original format and set the state
  };

  const assignTask = (task: Task, user: User) => {
    // Assign task to user
    eventSubset.assignEvent(task.eventId, String(user)); // Changed user._id to user
    if (
      user.tasks &&
      task.assignedTo !== undefined &&
      Array.isArray(user.tasks)
    ) {
      // Update user's assigned tasks
      user.tasks.push(task);
      // Update task's assigned user
      task.assignedTo = user; // Changed user._id to user
    }
  };

  const assignUser = {} as Record<string, string[]>;

  const reassignUser = {} as Record<string, ReassignEventResponse[]>

  const unassignUser = {} as Record<string, string[]>;

  const reassignUsersForArray = (
    user: string,
    newUser: ExtendedCalendarEvent,
    eventOrTodo: BaseCustomEvent | Todo
  ) => {
    reassignUserForSingle(
      user,
      newUser,
      eventOrTodo);
  };

  const reassignUserForSingle = (
    user: string,
    newUser: ExtendedCalendarEvent,
    eventOrTodo: BaseCustomEvent | Todo
  ) => {
    reassignUsersToEvents([user], newUser, eventOrTodo);
  };

  const {
    reassignUsersToEvents
  } = eventSubset;
  const userStore = makeAutoObservable({
    // User-related properties and methods
    users,
    currentUser,
    updateUserState,
    assignTask,
    assignUser,
    reassignUser,
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
    setDynamicNotificationMessage: useAssignEventStore().setDynamicNotificationMessage,
    reassignUsersToEvents: useAssignEventStore().reassignUsersToEvents,
    updateEventStatus: useAssignEventStore().updateEventStatus,
    connectResponsesToTodos: useAssignEventStore().connectResponsesToTodos,
  
    // Task-related properties and methods
    assignedTasks: useAssignTeamMemberStore().assignedTasks,
    assignedItems: useAssignTeamMemberStore().assignedItems,
    assignedTeams: useAssignTeamMemberStore().assignedTeams,
    assignItem: useAssignTeamMemberStore().events,
    assignTodoToTeam: useAssignTeamMemberStore().assignTodoToTeam,
    assignTodosToUsersOrTeams: useAssignTeamMemberStore().assignTodosToUsersOrTeams,
    assignTeamMemberToTeam: useAssignTeamMemberStore().assignTeamMemberToTeam,
    unassignTeamMemberFromItem: useAssignTeamMemberStore().unassignTeamMemberFromItem,
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
    assignBoardPermissionToTeam: useAssignBaseStore().assignBoardPermissionToTeam,
    assignBoardNotificationToTeam: useAssignBaseStore().assignBoardNotificationToTeam,
    assignBoardIntegrationToTeam: useAssignBaseStore().assignBoardIntegrationToTeam,
    assignBoardAutomationToTeam: useAssignBaseStore().assignBoardAutomationToTeam,
    assignBoardCustomFieldToTeam: useAssignBaseStore().assignBoardCustomFieldToTeam,
  });
  
  return userStore;
}  

export { userManagerStore };
