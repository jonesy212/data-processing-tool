// AssignBaseStore.tsx
import { makeAutoObservable } from "mobx";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { Todo } from "../todos/Todo";
import SnapshotStore from "./stores/SnapshotStore";

export interface AssignBaseStore {
  assignedUsers: Record<string, string[]>; // Use ID as key and array of user IDs as value
  assignedItems: Record<string, string[]>; // Use ID as key and array of item IDs as value
  assignedTodos: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  assignedTasks: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  assignItem: (itemId: string, userId: string) => void;
  assignUser: (itemId: string, userId: string) => void;
  unassignUser: (itemId: string, userId: string) => void;
  reassignUser: (itemId: string, oldUserId: string, newUserId: string) => void;
  assignUsersToItems: (itemIds: string[], userId: string) => void;
  unassignUsersFromItems: (itemIds: string[], userId: string) => void;
  setDynamicNotificationMessage: (message: string) => void;
  snapshotStore: SnapshotStore<Record<string, Todo[]>>

  reassignUsersToItems: (
    itemIds: string[],
    oldUserId: string,
    newUserId: string
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

const useAssignBaseStore = (): AssignBaseStore => {
  const assignedUsers: Record<string, string[]> = {};
  const assignedItems: Record<string, string[]> = {};
  const assignedTodos: Record<string, string[]> = {};
  // Create an instance of SnapshotStore
  const snapshotStore = new SnapshotStore<Record<string, Todo[]>>({});

  const assignItem = (itemId: string, assignedTo: string) => {
    // Perform the item assignment logic here
    // For example, update the assignedItems record
    if (!assignedItems[itemId]) {
      assignedItems[itemId] = [assignedTo];
    } else {
      assignedItems[itemId].push(assignedTo);
    }

    // TODO: Implement any additional logic needed when assigning an item
  };

  const assignUser = (itemId: string, userId: string) => {
    // Check if the itemId already exists in the assignedUsers
    if (!assignedUsers[itemId]) {
      assignedUsers[itemId] = [userId];
    } else {
      // Check if the user is not already assigned to the item
      if (!assignedUsers[itemId].includes(userId)) {
        assignedUsers[itemId].push(userId);
      }
    }

    // TODO: Implement any additional logic needed when assigning a user to an item
  };

  const unassignUser = (itemId: string, userId: string) => {
    // Check if the itemId exists in the assignedUsers
    if (assignedUsers[itemId]) {
      // Remove the user from the assignedUsers for the given itemId
      assignedUsers[itemId] = assignedUsers[itemId].filter(
        (id) => id !== userId
      );

      // Remove the itemId entry if there are no more assigned users
      if (assignedUsers[itemId].length === 0) {
        delete assignedUsers[itemId];
      }
    }
    // TODO: Implement any additional logic needed when unassigning a user from an item
  };

  const reassignUser = (
    itemId: string,
    oldUserId: string,
    newUserId: string
  ) => {
    // Check if the itemId exists in the assignedUsers
    if (assignedUsers[itemId]) {
      // Remove the oldUserId from the assignedUsers for the given itemId
      assignedUsers[itemId] = assignedUsers[itemId].filter(
        (id) => id !== oldUserId
      );

      // Check if the newUserId is not already assigned to the item
      if (!assignedUsers[itemId].includes(newUserId)) {
        assignedUsers[itemId].push(newUserId);
      }

      // Remove the itemId entry if there are no more assigned users
      if (assignedUsers[itemId].length === 0) {
        delete assignedUsers[itemId];
      }
    }
    // TODO: Implement any additional logic needed when reassigning a user from old user to new user for an item
  };

  const assignUsersToItems = (itemIds: string[], userId: string) => {
    itemIds.forEach((itemId) => {
      // Check if the itemId already exists in the assignedUsers
      if (!assignedUsers[itemId]) {
        assignedUsers[itemId] = [userId];
      } else {
        // Check if the user is not already assigned to the item
        if (!assignedUsers[itemId].includes(userId)) {
          assignedUsers[itemId].push(userId);
        }
      }
    });
    // TODO: Implement any additional logic needed when assigning a user to multiple items
  };

  const unassignUsersFromItems = (itemIds: string[], userId: string) => {
    itemIds.forEach((itemId) => {
      // Check if the itemId exists in the assignedUsers
      if (assignedUsers[itemId]) {
        // Remove the user from the assignedUsers for the given itemId
        assignedUsers[itemId] = assignedUsers[itemId].filter(
          (id) => id !== userId
        );

        // Remove the itemId entry if there are no more assigned users
        if (assignedUsers[itemId].length === 0) {
          delete assignedUsers[itemId];
        }
      }
    });
    // TODO: Implement any additional logic needed when unassigning a user from multiple items
  };

  const reassignUsersToItems = (
    itemIds: string[],
    oldUserId: string,
    newUserId: string
  ) => {
    itemIds.forEach((itemId) => {
      // Check if the itemId exists in the assignedUsers
      if (assignedUsers[itemId]) {
        // Remove the oldUserId and add the newUserId to the assignedUsers for the given itemId
        assignedUsers[itemId] = [
          ...assignedUsers[itemId].filter((id) => id !== oldUserId),
          newUserId,
        ];

        // Remove the itemId entry if there are no more assigned users
        if (assignedUsers[itemId].length === 0) {
          delete assignedUsers[itemId];
        }
      }
    });
    // TODO: Implement any additional logic needed when reassigning a user from old user to new user for multiple items
  };

  const assignUserToTodo = (todoId: string, userId: string) => {
    // Check if the todoId already exists in the assignedUsers
    if (!assignedUsers[todoId]) {
      assignedUsers[todoId] = [userId];
    } else {
      // Check if the user is not already assigned to the todo
      if (!assignedUsers[todoId].includes(userId)) {
        assignedUsers[todoId].push(userId);
      }
    }
    // TODO: Implement any additional logic needed when assigning a user to a todo
  };

  const unassignUserFromTodo = (todoId: string, userId: string) => {
    // Check if the todoId exists in the assignedUsers
    if (assignedUsers[todoId]) {
      // Remove the user from the assignedUsers for the given todoId
      assignedUsers[todoId] = assignedUsers[todoId].filter(
        (id) => id !== userId
      );

      // Remove the todoId entry if there are no more assigned users
      if (assignedUsers[todoId].length === 0) {
        delete assignedUsers[todoId];
      }
    }
  };

  const reassignUserInTodo = (
    todoId: string,
    oldUserId: string,
    newUserId: string
  ) => {
    // Unassign old user and assign new user to the todo
    unassignUserFromTodo(todoId, oldUserId);
    assignUserToTodo(todoId, newUserId);
  };

  const assignUsersToTodos = (todoIds: string[], userId: string) => {
    todoIds.forEach((todoId) => {
      assignUserToTodo(todoId, userId);
    });
    // TODO: Implement any additional logic needed when assigning a user to multiple todos
  };

  const unassignUsersFromTodos = (todoIds: string[], userId: string) => {
    todoIds.forEach((todoId) => {
      unassignUserFromTodo(todoId, userId);
    });
    // TODO: Implement any additional logic needed when unassigning a user from multiple todos
  };

  const reassignUsersInTodos = (
    todoIds: string[],
    oldUserId: string,
    newUserId: string
  ) => {
    todoIds.forEach((todoId) => {
      // Unassign old user and assign new user to each todo
      unassignUserFromTodo(todoId, oldUserId);
      assignUserToTodo(todoId, newUserId);
    });
    // TODO: Implement any additional logic needed when reassigning a user from old user to new user for multiple todos
  };

  // Success and Failure methods
  const assignUserSuccess = () => {
    console.log("Assign user success!");
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };

  const assignUserFailure = (error: string) => {
    console.error("Assign user failure:", error);
    // You can add additional error handling or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.User_Error.ASSIGN_USER_FAILURE
    );
  };

  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setDynamicNotificationMessage(message);
  };

  makeAutoObservable({
    assignItem,
    assignedUsers,
    assignedItems,
    assignedTodos,
    assignUser,
    unassignUser,
    reassignUser,
    assignUsersToItems,
    unassignUsersFromItems,
    reassignUsersToItems,
    assignUserToTodo,
    unassignUserFromTodo,
    reassignUserInTodo,
    assignUsersToTodos,
    unassignUsersFromTodos,
    reassignUsersInTodos,
    assignUserSuccess,
    assignUserFailure,
    setDynamicNotificationMessage,
    // Add more properties or methods as needed
  });

  return {
    assignItem,
    assignedUsers,
    assignedItems: {},
    assignedTasks: {},
    assignedTodos: {},
    snapshotStore,
    assignUser,
    unassignUser,
    reassignUser,
    assignUsersToItems,
    unassignUsersFromItems,
    reassignUsersToItems,
    assignUserToTodo,
    unassignUserFromTodo,
    reassignUserInTodo,
    assignUsersToTodos,
    unassignUsersFromTodos,
    reassignUsersInTodos,
    assignUserSuccess,
    assignUserFailure,
      setDynamicNotificationMessage,
    // Add more properties or methods as needed
  };
};

export { useAssignBaseStore };
