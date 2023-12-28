// AssignTaskStore.tsx
import { makeAutoObservable } from "mobx";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

export interface AssignTaskStore {
  assignedUsers: Record<string, string[]>; // Use taskId as key and array of user IDs as value
  assignedTasks: Record<string, string[]>; // Use taskId as key and array of task IDs as value
  assignedTodos: Record<string, string[]>; // Use taskId as key and array of todo IDs as value
  assignUser: (taskId: string, userId: string) => void;
  unassignUser: (taskId: string, userId: string) => void;
  reassignUser: (taskId: string, oldUserId: string, newUserId: string) => void;
  assignUsersToTasks: (taskIds: string[], userId: string) => void;
  unassignUsersFromTasks: (taskIds: string[], userId: string) => void;
  setDynamicNotificationMessage: (message: string) => void;

  reassignUsersToTasks: (
    taskIds: string[],
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

const useAssignTaskStore = (): AssignTaskStore => {
  const assignedUsers: Record<string, string[]> = {};
  const assignedTasks: Record<string, string[]> = {};
  const assignedTodos: Record<string, string[]> = {};

  const assignUser = (taskId: string, userId: string) => {
    // Check if the taskId already exists in the assignedUsers
    if (!assignedUsers[taskId]) {
      assignedUsers[taskId] = [userId];
    } else {
      // Check if the user is not already assigned to the task
      if (!assignedUsers[taskId].includes(userId)) {
        assignedUsers[taskId].push(userId);
      }
    }

    // TODO: Implement any additional logic needed when assigning a user to a task
  };

  const unassignUser = (taskId: string, userId: string) => {
    // Check if the taskId exists in the assignedUsers
    if (assignedUsers[taskId]) {
      // Remove the user from the assignedUsers for the given taskId
      assignedUsers[taskId] = assignedUsers[taskId].filter(
        (id) => id !== userId
      );

      // Remove the taskId entry if there are no more assigned users
      if (assignedUsers[taskId].length === 0) {
        delete assignedUsers[taskId];
      }
    }
    // TODO: Implement any additional logic needed when unassigning a user from a task
  };

  const reassignUser = (
    taskId: string,
    oldUserId: string,
    newUserId: string
  ) => {
    // Check if the taskId exists in the assignedUsers
    if (assignedUsers[taskId]) {
      // Remove the oldUserId from the assignedUsers for the given taskId
      assignedUsers[taskId] = assignedUsers[taskId].filter(
        (id) => id !== oldUserId
      );

      // Check if the newUserId is not already assigned to the task
      if (!assignedUsers[taskId].includes(newUserId)) {
        assignedUsers[taskId].push(newUserId);
      }

      // Remove the taskId entry if there are no more assigned users
      if (assignedUsers[taskId].length === 0) {
        delete assignedUsers[taskId];
      }
    }
    // TODO: Implement any additional logic needed when reassigning a user from old user to new user for a task
  };

  const assignUsersToTasks = (taskIds: string[], userId: string) => {
    taskIds.forEach((taskId) => {
      // Check if the taskId already exists in the assignedUsers
      if (!assignedUsers[taskId]) {
        assignedUsers[taskId] = [userId];
      } else {
        // Check if the user is not already assigned to the task
        if (!assignedUsers[taskId].includes(userId)) {
          assignedUsers[taskId].push(userId);
        }
      }
    });
    // TODO: Implement any additional logic needed when assigning a user to multiple tasks
  };

  const unassignUsersFromTasks = (taskIds: string[], userId: string) => {
    taskIds.forEach((taskId) => {
      // Check if the taskId exists in the assignedUsers
      if (assignedUsers[taskId]) {
        // Remove the user from the assignedUsers for the given taskId
        assignedUsers[taskId] = assignedUsers[taskId].filter(
          (id) => id !== userId
        );

        // Remove the taskId entry if there are no more assigned users
        if (assignedUsers[taskId].length === 0) {
          delete assignedUsers[taskId];
        }
      }
    });
    // TODO: Implement any additional logic needed when unassigning a user from multiple tasks
  };

  const reassignUsersToTasks = (
    taskIds: string[],
    oldUserId: string,
    newUserId: string
  ) => {
    taskIds.forEach((taskId) => {
      // Check if the taskId exists in the assignedUsers
      if (assignedUsers[taskId]) {
        // Remove the oldUserId and add the newUserId to the assignedUsers for the given taskId
        assignedUsers[taskId] = [
          ...assignedUsers[taskId].filter((id) => id !== oldUserId),
          newUserId,
        ];

        // Remove the taskId entry if there are no more assigned users
        if (assignedUsers[taskId].length === 0) {
          delete assignedUsers[taskId];
        }
      }
    });
    // TODO: Implement any additional logic needed when reassigning a user from old user to new user for multiple tasks
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
    assignedUsers,
    assignedTasks,
    assignedTodos,
    assignUser,
    unassignUser,
    reassignUser,
    assignUsersToTasks,
    unassignUsersFromTasks,
    reassignUsersToTasks,
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
    assignedUsers,
    assignedTasks,
    assignedTodos,
    assignUser,
    unassignUser,
    reassignUser,
    assignUsersToTasks,
    unassignUsersFromTasks,
    reassignUsersToTasks,
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

export { useAssignTaskStore };
