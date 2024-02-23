import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Task } from "../../models/tasks/Task";
import { sanitizeData } from "../../security/SanitizationFunctions";
import { User } from "../../users/User";
import { AssignBaseStore } from "../AssignBaseStore";
import { AssignEventStore, useAssignEventStore } from "./AssignEventStore";

// Define a custom interface that extends necessary properties from AssignEventStore and AssignBaseStore
interface CustomUserStore extends Pick<AssignEventStore, 'assignedUsers' | 'updateEventStatus' | 'assignedEvents' | 'assignedTodos' | 'assignEvent' | 'assignUser' | 'unassignUser' | 'reassignUser' | 'assignUsersToEvents' | 'unassignUsersFromEvents' | 'setDynamicNotificationMessage' | 'reassignUsersToEvents' | 'assignUserToTodo' | 'unassignUserFromTodo' | 'reassignUserInTodo' | 'assignUsersToTodos' | 'unassignUsersFromTodos' | 'reassignUsersInTodos' | 'assignUserSuccess' | 'assignUserFailure'>, AssignBaseStore {
  // Add additional properties specific to UserStore if needed
  users: Record<string, User[]>;
  currentUser: User | null;
  updateUserState: (newUsers: Record<string, User[]>) => void;
  assignTask: (task: Task, user: User) => void;
}

const userManagerStore = (): CustomUserStore => {
  const [users, setUsers] = useState<Record<string, User[]>>({
    // Initialize with the required structure
  });

  // Accessing the currentUser from AuthContext
  const { state: { user: currentUser } } = useAuth();

  // Sanitize input before updating user state
  const updateUserState = (newUsers: Record<string, User[]>) => {
    // Sanitize the data before updating
    const sanitizedUsers = sanitizeData(JSON.stringify(newUsers)); // Sanitize the data and convert it back to JSON
    setUsers(JSON.parse(sanitizedUsers)); // Convert the sanitized data back to its original format and set the state
  };

  // Implement assignTask action
  const assignTask = (task: Task, user: User) => {
    // Logic to assign task to user
  };

  // Use the useAssignEventStore hook to access methods and properties from AssignEventStore
  const assignEventStore = useAssignEventStore();

  const userStore = makeAutoObservable({
    users,
    currentUser,
    updateUserState,
    assignTask,
    ...assignEventStore,
    // Add other user-related properties as needed
  });

  return userStore;
};

export { userManagerStore };
