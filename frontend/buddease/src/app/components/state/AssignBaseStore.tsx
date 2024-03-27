// AssignBaseStore.tsx
import { makeAutoObservable } from "mobx";
import { Data } from "../models/data/Data";
import SnapshotStore, { Snapshot, snapshotStore } from "../snapshots/SnapshotStore";
import { useNotification } from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { Todo } from "../todos/Todo";
import { User } from "../users/User";






const {notify} = useNotification()
export interface AssignBaseStore {
  assignedUsers: Record<string, string[]>; // Use ID as key and array of user IDs as value
  assignedItems: Record<string, string[]>; // Use ID as key and array of item IDs as value
  assignedTodos: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  assignedTasks: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  assignedTeams: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  events: Record<string, Data[]>;
  assignItem: (itemId: string, userId: string) => void;
  assignUser: (itemId: string, userId: string) => void;
  assignTeam: (itemId: string, teamId: string) => void;
  unassignUser: (itemId: string, userId: string) => void;
  reassignUser: (itemId: string, oldUserId: string, newUserId: string) => void;
  assignUsersToItems: (itemIds: string[], userId: string) => void;
  unassignUsersFromItems: (itemIds: string[], userId: string) => void;
  
  assignTaskToTeam: (taskId: string, userId: string) => Promise<void>;
  assignTodoToTeam: (todoId: string, teamId: string) => Promise<void>;
  assignTodosToUsersOrTeams: (todoIds: string[], assignees: string[]) => Promise<void>;

  assignTeamMemberToTeam: (teamId: string, userId: string) => void;
  unassignTeamMemberFromItem: (itemId: string, userId: string) => void;

  setDynamicNotificationMessage: (message: string) => void;
  snapshotStore: SnapshotStore<Snapshot<Data>>

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

  assignTeamToTodo: (todoId: string, teamId: string) => void;
  unassignTeamToTodo: (todoId: string, teamId: string) => void;
  reassignTeamToTodo: (
    todoId: string,
    oldTeamId: string,
    newTeamId: string
  ) => void;
  
  assignTeamToTodos: (todoIds: string[], teamId: string) => void;
  unassignTeamFromTodos: (todoIds: string[], teamId: string) => void;
  reassignTeamToTodos: (
    teamIds: string[],
    teamId: string,
    newTeamId: string

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
  const assignedTeams: Record<string, string[]> = {};
  const assignedTasks: Record<string, string[]> = {};
  const events: Record<string, Data[]> = {};
  // Create an instance of SnapshotStore

    

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


  const assignTeam = (itemId: string, teamId: string) => {
    // Check if the itemId already exists in the assignedTeams
    if (!assignedTeams[itemId]) {
      assignedTeams[itemId] = [teamId];
    } else {
      // Check if the team is not already assigned to the item
      if (!assignedTeams[itemId].includes(teamId)) {
        assignedTeams[itemId].push(teamId);
      }
    }
  }


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
      NOTIFICATION_MESSAGES.User.ASSIGN_USER_FAILURE
    );
  };

  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setDynamicNotificationMessage(message);
  };



  const assignTaskToTeam = async (taskId: string, teamId: string) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Perform the task assignment logic here
      // For example, update the assignedTasks record
      if (!assignedTasks[taskId]) {
        assignedTasks[taskId] = [teamId];
      } else {
        assignedTasks[taskId].push(teamId);
      }

      // TODO: Implement any additional logic needed when assigning a task to a team

      // Resolve the promise after completing the operation
      resolve();
    });
  };

   const assignTodoToUser = async (user: User, todo: Todo) => { 
    // Add user to todo's assignedUsers
    todo.assignedUsers.push(user._id);

    // Save updates to todo
    await todo.save();
  }

  const assignTodoToTeam = async (todoId: string, teamId: string) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Perform the todo assignment logic here
      // For example, update the assignedTodos record
      if (!assignedTodos[todoId]) {
        assignedTodos[todoId] = [teamId];
      } else {
        assignedTodos[todoId].push(teamId);
      }

      // TODO: Implement any additional logic needed when assigning a todo to a team

      // Resolve the promise after completing the operation
      resolve();
    });
  };

  const assignTeamMemberToTeam = (itemId: string, userId: string) => {
    // Perform the team member assignment logic here
    // For example, update the assignedTeams record
    if (!assignedTeams[itemId]) {
      assignedTeams[itemId] = [userId];
    } else {
      assignedTeams[itemId].push(userId);
    }

    // TODO: Implement any additional logic needed when assigning a team member to an item
  };

  const unassignTeamMemberFromItem = (itemId: string, userId: string) => {
    // Check if the itemId exists in the assignedTeams
    if (assignedTeams[itemId]) {
      // Remove the team member from the assignedTeams for the given itemId
      assignedTeams[itemId] = assignedTeams[itemId].filter(
        (id) => id !== userId
      );

      // Remove the itemId entry if there are no more assigned team members
      if (assignedTeams[itemId].length === 0) {
        delete assignedTeams[itemId];
      }
    }
    // TODO: Implement any additional logic needed when unassigning a team member from an item
  };


  const assignTeamToTodo = async (todoId: string, teamId: string) => { 
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Perform the todo assignment logic here
      // For example, update the assignedTodos record
      if (!assignedTodos[todoId]) {
        assignedTodos[todoId] = [teamId];
      } else {
        assignedTodos[todoId].push(teamId);
      }

      // TODO: Implement any additional logic needed when assigning a team to a todo

      // Resolve the promise after completing the operation
      resolve();
    });
  }

  const assignTodosToUsersOrTeams = async (todoIds: string[], assignees: string[]) => { 
    for (let i = 0; i < todoIds.length; i++) {
      const todoId = todoIds[i];
      for (let j = 0; j < assignees.length; j++) {
        const assignee = assignees[j];
        if (assignee.includes("user-")) {
          // Assign todo to user
          await assignTodoToUser(
            assignee as unknown as User,
            todoId as unknown as Todo
          );
        } else {
          // Assign todo to team
          await assignTodoToTeam(todoId, assignee);
        }
      }
    }
  };

  const unassignTeamToTodo = async (todoId: string, teamId: string) => { 
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Check if the todoId exists in the assignedTodos
      if (assignedTodos[todoId]) {
        // Remove the team from the assignedTodos for the given todoId
        assignedTodos[todoId] = assignedTodos[todoId].filter(
          (id) => id !== teamId
        );

        // Remove the todoId entry if there are no more assigned teams
        if (assignedTodos[todoId].length === 0) {
          delete assignedTodos[todoId];
        }
      }

      // Resolve the promise after completing the operation
      resolve();
    });
  }


  const reassignTeamToTodo = async (todoId: string, oldTeamId: string, newTeamId: string) => { 
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Unassign old team and assign new team to todo
      unassignTeamToTodo(todoId, oldTeamId);
      assignTeamToTodo(todoId, newTeamId);

      // Resolve the promise after completing the operation
      resolve();
    });
  }


  const assignTeamToTodos = async (todoIds: string[], teamId: string) => { 
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>(async (resolve) => {
      // Loop through todos and assign team to each
      for(let todoId of todoIds) {
        await assignTeamToTodo(todoId, teamId);
      }

      // Resolve the promise after completing the operation
      resolve();
    });
  }

  const unassignTeamFromTodos = async (todoIds: string[], teamId: string) => { 
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>(async (resolve) => {
      // Loop through todos and unassign team from each
      for(let todoId of todoIds) {
        await unassignTeamToTodo(todoId, teamId);
      }

      // Resolve the promise after completing the operation
      resolve();
    });
  }


  const reassignTeamToTodos = async (todoIds: string[], oldTeamId: string, newTeamId: string) => { 
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>(async (resolve) => {
      // Loop through todos and reassign team for each
      for(let todoId of todoIds) {
        await reassignTeamToTodo(todoId, oldTeamId, newTeamId);
      }

      // Resolve the promise after completing the operation
      resolve();
    });
  }


  const store: AssignBaseStore = makeAutoObservable({
      assignItem,
      assignedUsers,
      events: {},
      assignedItems: {},
      assignedTasks: {},
      assignedTodos: {},
      assignedTeams: {},
      assignTeamToTodo,
      unassignTeamToTodo,
      reassignTeamToTodo,
      assignTeamToTodos, 
      assignTeamMemberToTeam,
      assignTeam,
      assignTaskToTeam,
      assignTodoToTeam,
      unassignTeamMemberFromItem,
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
      reassignTeamToTodos,
      unassignTeamFromTodos,
      assignTodosToUsersOrTeams,
      snapshotStore: snapshotStore,
      // Add more properties or methods as needed
    
  })
  return store
   
};

export { useAssignBaseStore };
