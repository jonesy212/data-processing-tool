import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Task } from "../../models/tasks/Task";
import { sanitizeData } from "../../security/SanitizationFunctions";
import { User } from "../../users/User";
import { AssignBaseStore } from "../AssignBaseStore";
import { WritableDraft } from "../redux/ReducerGenerator";
import { AssignEventStore, useAssignEventStore } from "./AssignEventStore";
import { useAssignTeamMemberStore } from "./AssignTeamMemberStore";

type EventStoreSubset = Pick<
  ReturnType<typeof useAssignEventStore>,
  | "assignedUsers"
  | "updateEventStatus"
  | "assignedEvents"
  | "assignedTodos"
  | "assignEvent"
  | "assignUser"
  | "unassignUser"
  | "reassignUser"
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

// Define a custom interface that extends necessary properties from AssignEventStore and AssignBaseStore
export interface UserStore extends AssignEventStore, AssignBaseStore {
  // Add additional properties specific to UserStore if needed
  users: Record<string, User[]>;
  currentUser: User | null;
  updateUserState: (newUsers: Record<string, User[]>) => void;
  assignTask: (task: Task, user: User) => void;
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

  // Use the useAssignEventStore hook to access methods and properties from AssignEventStore
  const {
    assignedUsers,
    assignedEvents,
    assignedTodos,
    assignEvent,
    assignUser,
    reassignUser,
    unassignUser,
    assignUsersToEvents,
    unassignUsersFromEvents,
    setDynamicNotificationMessage,
    reassignUsersToEvents,
    assignUserToTodo,
    unassignUserFromTodo,
    reassignUserInTodo,
    assignUsersToTodos,
    unassignUsersFromTodos,
    reassignUsersInTodos,
    assignUserSuccess,
    assignUserFailure,

    ...rest // Capture the remaining properties
  } = useAssignEventStore();

  const {
    assignedTasks,
    assignedItems,
    assignedTeams,
    events,
    assignItem,
    assignTeam,
    assignUsersToItems,
    unassignUsersFromItems,
    assignTaskToTeam,
    assignTodoToTeam,
    assignTodosToUsersOrTeams,
    assignTeamMemberToTeam,
    unassignTeamMemberFromItem, 
    snapshotStore,
    reassignUsersToItems,
    
    assignTeamToTodo,
    unassignTeamToTodo, 
    reassignTeamToTodo,
    assignTeamToTodos,
    unassignTeamFromTodos,
    reassignTeamToTodos
  } = useAssignTeamMemberStore();

  const userStore = makeAutoObservable({
    users,
    currentUser,
    updateUserState,
    assignTask,
    assignedUsers,
    assignedEvents,
    assignedTodos,
    assignEvent,
    assignUser,
    reassignUser,
    unassignUser,
    assignUsersToEvents,
    unassignUsersFromEvents,
    setDynamicNotificationMessage,
    reassignUsersToEvents,
    assignUserToTodo,
    unassignUserFromTodo,
    reassignUserInTodo,
    assignUsersToTodos,
    unassignUsersFromTodos,
    reassignUsersInTodos,
    assignUserSuccess,
    assignUserFailure,
    assignedTasks,
    assignedItems,
    assignedTeams,
    events,
    assignItem,
    assignTodoToTeam,
    assignTodosToUsersOrTeams,
    assignTeamMemberToTeam,
    unassignTeamMemberFromItem, 




    assignTeam,
    assignUsersToItems,
    unassignUsersFromItems,
    assignTaskToTeam,
    snapshotStore,
    reassignUsersToItems,
    assignTeamToTodo,
    unassignTeamToTodo, 
    reassignTeamToTodo,
    assignTeamToTodos,
    unassignTeamFromTodos,
    reassignTeamToTodos,
    ...rest, // Spread the remaining properties from useAssignEventStore
  });

  return userStore;
};

export { userManagerStore };
